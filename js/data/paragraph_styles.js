/*
 *  Paragraph Style List
 *  --------------------
 *  @last_update : 31 12 2013 - 10:23 (day month year - hours:minutes)
 */
/*        ------------------------------------------------
 *        | = = = = NE PAS MODIFIER CE FICHIER = = = = = |
 *        | MODIFIER : ./data/asset/paragraph_styles.txt |
 *        | PUIS RECHARGER L'APPLICATION (AUTO UPDATE)   |
 *        ------------------------------------------------
 */
 
 

PARAGRAPH_STYLES = ["titre_level_1", "titre_level_2", "titre_level_3", "scenario_scene", "scenario_action", "scenario_character", "scenario_note_jeu", "scenario_dialog", "action_lecteur", "note", "note_redaction"];

DATA_STYLES = {
	titre_level_1: {style_after:'titre_level_2'}, 
	titre_level_2: {style_after:'titre_level_3'}, 
	titre_level_3: {style_after:null}, 
	scenario_scene: {style_after:'scenario_action'}, 
	scenario_action: {style_after:'scenario_action'}, 
	scenario_character: {style_after:'scenario_dialog'}, 
	scenario_note_jeu: {style_after:'scenario_dialog'}, 
	scenario_dialog: {style_after:'scenario_action'}, 
	action_lecteur: {style_after:null}, 
	note: {style_after:null}, 
	note_redaction: {style_after:null}
}