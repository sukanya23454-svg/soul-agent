import { useState } from "react";
import { Upload, X, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  agentId: string;
  onUploadComplete?: () => void;
}

export const FileUpload = ({ agentId, onUploadComplete }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB limit)
      if (file.size > 52428800) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const filePath = `${user.id}/${agentId}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('agent-files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create database record
      const { data: fileRecord, error: dbError } = await supabase
        .from('agent_files')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          analysis_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Trigger analysis edge function
      const { error: analysisError } = await supabase.functions.invoke('analyze-file', {
        body: { fileId: fileRecord.id }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
      }

      toast({
        title: "File uploaded",
        description: "Your file is being analyzed...",
      });

      setSelectedFile(null);
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        {!selectedFile ? (
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              PDF, images, text files (max 50MB)
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.webp,.doc,.docx"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <File className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};