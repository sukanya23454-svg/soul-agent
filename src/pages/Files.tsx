import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { ArrowLeft, File, Trash2, Download, Loader2 } from "lucide-react";
import type { AgentFile, Agent } from "@/integrations/supabase/database.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Files = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      loadFiles();
    }
  }, [selectedAgentId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    await loadAgents();
  };

  const loadAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load agents",
        variant: "destructive",
      });
      return;
    }

    setAgents(data || []);
    if (data && data.length > 0) {
      setSelectedAgentId(data[0].id);
    }
    setLoading(false);
  };

  const loadFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_files")
      .select("*")
      .eq("agent_id", selectedAgentId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (file: AgentFile) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('agent-files')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('agent_files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      toast({
        title: "File deleted",
        description: "File removed successfully",
      });

      loadFiles();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (file: AgentFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('agent-files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      processing: "default",
      completed: "outline",
      failed: "destructive" as any,
    };
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">File Manager</h1>
        </div>

        {agents.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No agents found</p>
            <Button onClick={() => navigate("/create-agent")}>
              Create Your First Agent
            </Button>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Select Agent:</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FileUpload agentId={selectedAgentId} onUploadComplete={loadFiles} />

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : files.length === 0 ? (
              <Card className="p-8 text-center">
                <File className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No files uploaded yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <File className="w-5 h-5 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.file_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                          </p>
                          {file.analysis_summary && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {file.analysis_summary}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(file.analysis_status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Files;