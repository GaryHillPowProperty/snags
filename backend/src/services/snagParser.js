export function parseAndValidateSnags(rawSnags, defaultProject = 'Unknown Project') {
  return rawSnags.map((s, i) => ({
    snag_description: String(s.snag_description || '').trim() || `Snag ${i + 1}`,
    project_name: String(s.project_name || defaultProject).trim(),
    recommended_trade: String(s.recommended_trade || '').trim() || null,
    recommended_builder: String(s.recommended_builder || '').trim() || null,
    deadline: String(s.deadline || '').trim() || null,
    materials_needed: String(s.materials_needed || '').trim() || null,
    plant_needed: String(s.plant_needed || '').trim() || null,
    drawing_reference: String(s.drawing_reference || '').trim() || null,
    additional_notes: String(s.additional_notes || '').trim() || null,
  })).filter(s => s.snag_description);
}
