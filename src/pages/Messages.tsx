import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Inbox, Send, Trash2, Eye, Reply, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  property_id: string | null;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const Messages = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubject, setReplySubject] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // الاستماع للرسائل الجديدة في الوقت الفعلي
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inbox"] });
          toast.info("لديك رسالة جديدة");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const { data: inbox = [], isLoading: inboxLoading } = useQuery({
    queryKey: ["inbox", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("receiver_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user,
  });

  const { data: sent = [], isLoading: sentLoading } = useQuery({
    queryKey: ["sent", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["sent"] });
      toast.success("تم حذف الرسالة");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف الرسالة");
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMessage || !user) return;

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedMessage.sender_id,
        property_id: selectedMessage.property_id,
        subject: replySubject || `رد: ${selectedMessage.subject}`,
        content: replyContent,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sent"] });
      setReplyContent("");
      setReplySubject("");
      setSelectedMessage(null);
      toast.success("تم إرسال الرد");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إرسال الرد");
    },
  });

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message);
    setReplySubject(`رد: ${message.subject}`);
    if (!message.is_read && message.receiver_id === user?.id) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const unreadCount = inbox.filter((m) => !m.is_read).length;

  const MessageCard = ({ message, isSent = false }: { message: Message; isSent?: boolean }) => (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        !message.is_read && !isSent ? "border-primary bg-primary/5" : ""
      }`}
      onClick={() => handleOpenMessage(message)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{message.subject}</CardTitle>
          <div className="flex items-center gap-2">
            {!message.is_read && !isSent && (
              <Badge variant="default" className="text-xs">جديد</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), "dd MMM", { locale: ar })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2">{message.content}</CardDescription>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">الرسائل</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} جديد</Badge>
          )}
        </div>

        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="inbox" className="gap-2">
              <Inbox className="w-4 h-4" />
              الوارد ({inbox.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="w-4 h-4" />
              المرسل ({sent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            {inboxLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : inbox.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد رسائل واردة</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {inbox.map((message) => (
                  <MessageCard key={message.id} message={message} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentLoading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : sent.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد رسائل مرسلة</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sent.map((message) => (
                  <MessageCard key={message.id} message={message} isSent />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* نافذة عرض الرسالة */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(selectedMessage.created_at), "dd MMMM yyyy - HH:mm", {
                    locale: ar,
                  })}
                </div>
                <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>

                {/* نموذج الرد - يظهر فقط للرسائل الواردة */}
                {selectedMessage.receiver_id === user?.id && (
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Reply className="w-4 h-4" />
                      رد على الرسالة
                    </h4>
                    <Input
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      placeholder="الموضوع"
                    />
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => deleteMessageMutation.mutate(selectedMessage.id)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                      <Button
                        onClick={() => sendReplyMutation.mutate()}
                        disabled={!replyContent.trim() || sendReplyMutation.isPending}
                      >
                        {sendReplyMutation.isPending ? "جاري الإرسال..." : "إرسال الرد"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Messages;
