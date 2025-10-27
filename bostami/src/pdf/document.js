import BostamiDocument from "./templates/bostami";
import RyancvDocument from "./templates/ryancv";

export const DOCUMENT_TEMPLATES = {
  bostami: BostamiDocument,
  ryancv: RyancvDocument,
};

export const getDocumentTemplate = (templateId = "bostami") =>
  DOCUMENT_TEMPLATES[templateId] || DOCUMENT_TEMPLATES.bostami;

export default BostamiDocument;
