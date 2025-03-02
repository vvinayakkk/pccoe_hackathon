import axios from "axios";

// Load the FLASK_URL from the environment variables using import.meta.env
const FLASK_URL =
  import.meta.env.VITE_FLASK_URL || import.meta.env.VITE_API_URL;

// Define the function to redact an image
export async function redactImage(
  file: File,
  language: string = "en",
  entities: string[]
): Promise<Blob> {
  try {
    console.log("FLASK_URL", FLASK_URL);
    console.log("HERE IN REDACT IMAGE");
    // Create a FormData object to hold the request data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("entities", JSON.stringify(entities));

    // Send the POST request to the /redact-image endpoint
    const response = await axios.post(`${FLASK_URL}/redact-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob", // Expecting a binary response (image file)
    });

    // Return the redacted image file (Blob)
    return response.data;
  } catch (error) {
    // Handle errors and throw a custom error message
    const errorMessage =
      (error as any).response?.data?.message || "Failed to process image";
    throw new Error(errorMessage);
  }
}
