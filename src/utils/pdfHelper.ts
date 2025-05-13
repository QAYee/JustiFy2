import { Filesystem, Directory } from "@capacitor/filesystem";
import { jsPDF } from "jspdf";

/**
 * Save a PDF to the Android Downloads folder so it is visible in the phone's storage.
 * For web, triggers a browser download.
 */
export const savePdfToDevice = async (
  pdf: jsPDF,
  fileName: string,
  onSuccess?: (path?: string) => void,
  onError?: (error: any) => void
): Promise<void> => {
  try {
    // Get PDF as base64
    const pdfOutput = pdf.output("datauristring");
    const base64Data = pdfOutput.split(",")[1];

    // Detect Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.indexOf("android") > -1;

    if (isAndroid) {
      // Always save to public Downloads folder
      const filePath = `Download/${fileName}`;
      await Filesystem.writeFile({
        path: filePath,
        data: base64Data,
        directory: Directory.External,
        recursive: true,
      });
      if (onSuccess) onSuccess(`/storage/emulated/0/Download/${fileName}`);
    } else {
      // Web fallback
      pdf.save(fileName);
      if (onSuccess) onSuccess();
    }
  } catch (error) {
    if (onError) onError(error);
  }
};
