const CLICKUP_API = 'https://api.clickup.com/api/v2';

async function clickupRequest(method, path, body = null) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) throw new Error('CLICKUP_API_TOKEN not configured');

  const options = {
    method,
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${CLICKUP_API}${path}`, options);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`ClickUp API error ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function createTask(snag, mediaPaths = []) {
  const listId = process.env.CLICKUP_LIST_ID;
  if (!listId) throw new Error('CLICKUP_LIST_ID not configured');

  const description = [
    snag.snag_description,
    snag.additional_notes && `\n\n**Notes:** ${snag.additional_notes}`,
    snag.materials_needed && `\n**Materials needed:** ${snag.materials_needed}`,
    snag.plant_needed && `\n**Plant/equipment:** ${snag.plant_needed}`,
    snag.drawing_reference && `\n**Drawing ref:** ${snag.drawing_reference}`,
  ].filter(Boolean).join('');

  const task = await clickupRequest('POST', `/list/${listId}/task`, {
    name: `[${snag.project_name}] ${snag.snag_description}`,
    description,
    due_date: parseDeadlineToTimestamp(snag.deadline),
    priority: inferPriority(snag.deadline),
    status: 'to do',
  });

  if (task?.id && mediaPaths.length > 0) {
    await attachFilesToTask(task.id, mediaPaths);
  }

  return task;
}

async function attachFilesToTask(taskId, filePaths) {
  const token = process.env.CLICKUP_API_TOKEN;
  const FormData = (await import('form-data')).default;
  const { createReadStream } = await import('fs');
  const { basename } = await import('path');
  const axios = (await import('axios')).default;

  for (const filePath of filePaths) {
    try {
      const form = new FormData();
      form.append('attachment', createReadStream(filePath), { filename: basename(filePath) });

      await axios.post(`${CLICKUP_API}/task/${taskId}/attachment`, form, {
        headers: {
          Authorization: token,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
    } catch (err) {
      console.warn(`Error attaching ${filePath} to task ${taskId}: ${err.message}`);
    }
  }
}

function parseDeadlineToTimestamp(deadline) {
  if (!deadline) return null;
  const lower = String(deadline).toLowerCase();
  if (lower.includes('asap') || lower.includes('urgent')) {
    return Date.now() + 3 * 24 * 60 * 60 * 1000;
  }
  const date = new Date(deadline);
  return isNaN(date.getTime()) ? null : date.getTime();
}

function inferPriority(deadline) {
  if (!deadline) return 3;
  const lower = String(deadline).toLowerCase();
  if (lower.includes('asap') || lower.includes('urgent')) return 1;
  if (lower.includes('this week') || lower.includes('end of week')) return 2;
  return 3;
}

export async function getWorkspaces() {
  return clickupRequest('GET', '/team');
}

export async function getLists(spaceId) {
  const space = await clickupRequest('GET', `/space/${spaceId}`);
  return space?.lists || [];
}
