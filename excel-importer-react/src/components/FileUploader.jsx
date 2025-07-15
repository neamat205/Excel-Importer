import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";
import ErrorTable from "./ErrorTable";
import config from "../config";
const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [errors, setErrors] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
     
      const res = await fetch(`${config.BASE_URL}/import-excel`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const { summary, errors, downloadUrl } = data;

      setSummary(summary);
      setErrors(errors || []);
      setDownloadUrl(downloadUrl || null);

      if (downloadUrl && summary.invalid > 0) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "failed_rows.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert(`"Upload failed. Please check file and try again."${err}`);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <div className="h-2/5 max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center text-gray-800">Excel File Import</h2>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-blue-500 p-8 text-center rounded-lg bg-gray-50 hover:bg-blue-50 transition cursor-pointer"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <FiUploadCloud className="text-blue-500" size={64} />
          <p className="text-gray-600">
            {selectedFile ? (
              <span>
                <strong>Selected File:</strong> {selectedFile.name}
              </span>
            ) : (
              "Drag and drop an Excel file here, or click to select"
            )}
          </p>
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`w-full py-2 px-4 rounded-md font-semibold ${
          uploading || !selectedFile
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {uploading ? "Uploading..." : "Upload Excel File"}
      </button>

      {summary && (
        <div className="bg-gray-100 p-4 rounded-md">
          <p><strong>Total Rows:</strong> {summary.total}</p>
          <p><strong>Valid Rows:</strong> {summary.valid}</p>
          <p><strong>Invalid Rows:</strong> {summary.invalid}</p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              className="text-blue-600 underline mt-2 inline-block"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download failed rows
            </a>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div>
          <h3 className="text-red-600 font-semibold">Validation Errors</h3>
          <ErrorTable errors={errors} />
        </div>
      )}
    </div>
  );
};

export default FileUploader;
