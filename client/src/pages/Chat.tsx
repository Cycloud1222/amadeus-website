import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get session ID from localStorage or create new one
  const getSessionId = () => {
    let sessionId = localStorage.getItem("amadeus_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("amadeus_session_id", sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // Fetch conversation history
  const { data: messages = [], isLoading: loadingHistory } = trpc.chat.getHistory.useQuery(
    { sessionId },
    { refetchInterval: false }
  );

  const utils = trpc.useUtils();

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setAudioBlob(null);
      utils.chat.getHistory.invalidate({ sessionId });
    },
  });

  // Transcribe audio mutation
  const transcribeAudioMutation = trpc.chat.transcribeAudio.useMutation({
    onSuccess: (data) => {
      setMessage(data.text);
      setAudioBlob(null);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessageMutation.data]);

  const handleSendMessage = async () => {
    if (!message.trim() && !audioBlob) return;

    // If there's an audio blob, transcribe it first
    if (audioBlob) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        await transcribeAudioMutation.mutateAsync({
          audioData: base64Audio!,
          sessionId,
        });
      };
      reader.readAsDataURL(audioBlob);
      return;
    }

    // Send text message
    await sendMessageMutation.mutateAsync({
      sessionId,
      message: message.trim(),
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const isProcessing = sendMessageMutation.isPending || transcribeAudioMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="text-foreground hover:text-primary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <h1 className="text-xl font-bold neon-glow-pink">AMADEUS INTERFACE</h1>
              </div>
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              <span className="text-primary">STATUS:</span> CONNECTED
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="container py-8 space-y-6 max-w-4xl">
            {loadingHistory ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold neon-glow-cyan">READY TO CONNECT</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start a conversation with Amadeus. Ask questions about science, time travel, 
                  or just have a casual chat.
                </p>
              </div>
            ) : (
              messages.map((msg: Message, idx: number) => (
                <div
                  key={msg.id || `temp-${idx}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary/20 border border-primary/50 text-foreground"
                        : "bg-card border border-primary/30 text-card-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary uppercase">
                        {msg.role === "user" ? "YOU" : "AMADEUS"}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-[80%] md:max-w-[70%] rounded-lg p-4 bg-card border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-primary uppercase">AMADEUS</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-primary/30 bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <div className="max-w-4xl mx-auto">
            {audioBlob && (
              <div className="mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                <span className="text-sm text-foreground">Audio recorded. Click send to transcribe and send.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioBlob(null)}
                  className="text-destructive"
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`${
                  isRecording
                    ? "bg-destructive/20 border-destructive text-destructive"
                    : "border-primary/50 text-foreground hover:bg-primary/10"
                }`}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message or use voice input..."
                disabled={isProcessing || !!audioBlob}
                className="flex-1 bg-input border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !audioBlob) || isProcessing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground neon-border"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
