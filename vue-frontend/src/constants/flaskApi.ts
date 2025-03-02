//const baseUrl = "http://localhost:3000";
const baseUrl = "https://852e-182-48-217-239.ngrok-free.app";
const faceBaseUrl = "http://localhost:5000";

export const redactPdfUrl = `${baseUrl}/redact-pdf`;
export const redactImgUrl = `${baseUrl}/redact-image`;
export const analyzePdfUrl = `${baseUrl}/analyze-pdf`;
export const redactPdfWithStringsUrl = `${baseUrl}/redact-from-strings`;
export const encryptPdfUrl = `${baseUrl}/encrypt-pdf`;
export const redactFaceUrl = `${faceBaseUrl}/redact-faces`;
