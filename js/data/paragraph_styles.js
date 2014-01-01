/*
 *  Paragraph Style List
 *  --------------------
 *  @last_update : 01 01 2014 - 20:46 (day month year - hours:minutes)
 */
/*        ------------------------------------------------
 *        | = = = = NE PAS MODIFIER CE FICHIER = = = = = |
 *        | MODIFIER : ./data/asset/paragraph_styles.txt |
 *        | PUIS RECHARGER L'APPLICATION (AUTO UPDATE)   |
 *        ------------------------------------------------
 */
 
 

PARAGRAPH_STYLES = ["titre_level_1", "titre_level_2", "titre_level_3", "document_titre", "document_sous_titre", "document_partie", "document_sous_partie", "document_section", "document_paragraphe", "document_note", "scenario_scene", "scenario_action", "scenario_character", "scenario_note_jeu", "scenario_dialog", "action_lecteur", "note", "note_redaction"];

DATA_STYLES = {
	titre_level_1: {style_after:null}, 
	titre_level_2: {style_after:null}, 
	titre_level_3: {style_after:null}, 
	document_titre: {style_after:'document_paragraphe'}, 
	document_sous_titre: {style_after:'document_paragraphe'}, 
	document_partie: {style_after:'document_paragraphe'}, 
	document_sous_partie: {style_after:'document_paragraphe'}, 
	document_section: {style_after:'document_paragraphe'}, 
	document_paragraphe: {style_after:'document_paragraphe'}, 
	document_note: {style_after:'document_paragraphe'}, 
	scenario_scene: {style_after:'scenario_action'}, 
	scenario_action: {style_after:'scenario_action'}, 
	scenario_character: {style_after:'scenario_dialog'}, 
	scenario_note_jeu: {style_after:'scenario_dialog'}, 
	scenario_dialog: {style_after:'scenario_action'}, 
	action_lecteur: {style_after:null}, 
	note: {style_after:null}, 
	note_redaction: {style_after:null}
}