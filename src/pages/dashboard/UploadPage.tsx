import { useState, useCallback } from "react";
import { Upload as UploadIcon, File, X, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

const ACCEPTED = "*"; // Accept all file types

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [rawText, setRawText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const canProceed = files.length > 0 || rawText.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Upload Data</h1>
        <p className="text-muted-foreground mt-1">Upload files or paste raw data to start your analysis.</p>
      </div>

      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UploadIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-medium text-lg">Drag & drop files here</p>
          <p className="text-sm text-muted-foreground mt-1">
            Any file type, any size — CSV, Excel, PDF, DOCX, images, and more
          </p>
          <input id="file-input" type="file" multiple onChange={handleFileInput} className="hidden" />
        </CardContent>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Uploaded Files ({files.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <File className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Raw text */}
      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Or Paste Raw Data</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your data here (JSON, CSV, plain text...)"
            className="min-h-[120px]"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button
        disabled={!canProceed}
        onClick={() => navigate("/dashboard/process")}
        className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 h-12 text-base"
      >
        Continue to Analysis <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
};

export default UploadPage;
