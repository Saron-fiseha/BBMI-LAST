"use client"

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Send,
  Search,
  Users,
  Plus,
  Mail,
  MailOpen,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

interface Conversation {
  id: string;
  subject: string;
  other_user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  last_message: string;
  last_message_from_me: boolean;
  unread_count: number;
  updated_at: string;
  time_ago: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
  time_ago: string;
  is_from_me: boolean;
}

export default function StudentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setError(null);
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/student/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        if (!silent) {
          const errorData = await response.json();
          setError(
            errorData.details || errorData.error || "Failed to load conversations"
          );
          toast.error(errorData.error || "Failed to load conversations");
        }
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      if (!silent) {
        setError("Network error: Unable to connect to server");
        toast.error("Failed to load conversations");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/student/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        if (!silent) fetchConversations(true);
      } else {
        if (!silent) {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to load messages");
        }
        if (!silent) setMessages([]);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      if (!silent) toast.error("Failed to load messages");
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const messageContent = newMessage;
    setNewMessage("");

    // Optimistic update
    const tempId = "temp-" + Date.now();
    const tempMsg: Message = {
      id: tempId,
      sender_id: user?.id || "",
      sender_name: user?.name || "",
      content: messageContent,
      created_at: new Date().toISOString(),
      read_at: null,
      is_read: false,
      time_ago: "Just now",
      is_from_me: true
    };
    
    setMessages(prev => [...prev, tempMsg]);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/student/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          content: messageContent,
        }),
      });

      if (response.ok) {
        // Silently fetch to get the real ID and update conversation list
        fetchMessages(selectedConversation.id, true);
        fetchConversations(true);
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error("Failed to send message");
    }
  };

  const startNewConversation = async () => {
    if (!newUser || !newSubject || !initialMessage) {
      toast.error("Please fill in all fields");
      return;
    }

    setStartingConversation(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/student/messages/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_id_or_name: newUser,
          subject: newSubject,
          message: initialMessage,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Conversation started successfully!");
        setShowNewConversation(false);
        setNewUser("");
        setNewSubject("");
        setInitialMessage("");
        await fetchConversations();
      } else {
        toast.error(result.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Something went wrong");
    } finally {
      setStartingConversation(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.other_user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unread_count,
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-1.5rem)] mt-6 mx-4 md:mx-6 bg-white overflow-hidden rounded-t-2xl shadow-xl border border-gray-200 border-b-0">
      {error && (
        <Alert variant="destructive" className="m-4 shadow-sm shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
          {/* Conversations Sidebar */}
          <div className="flex flex-col overflow-hidden shadow-lg border-r border-gray-200 bg-white md:w-[280px] lg:w-[320px] shrink-0 h-full z-20">
            <div className="p-3 border-b bg-gray-50/50 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-0 ring-1 ring-gray-200 focus-visible:ring-blue-500 rounded-full h-9"
                />
              </div>
              <Button 
                onClick={() => setShowNewConversation(true)} 
                size="icon" 
                variant="outline"
                title="New Conversation"
                className="h-9 w-9 rounded-full shrink-0 border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-40 text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-mustard/10 flex items-center justify-center mb-3">
                    <MessageSquare className="h-6 w-6 text-custom-copper opacity-70" />
                  </div>
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        fetchMessages(conversation.id);
                      }}
                      className={`
                        group relative p-3 cursor-pointer transition-colors duration-200
                        hover:bg-gray-50
                        ${selectedConversation?.id === conversation.id 
                          ? "bg-[#E6F3FF]" 
                          : "bg-white"}
                      `}
                    >
                      {conversation.unread_count > 0 && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <Avatar className="h-10 w-10 shadow-sm">
                            <AvatarImage src={conversation.other_user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-medium">
                              {conversation.other_user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unread_count > 0 && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`text-[14px] truncate ${conversation.unread_count > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}>
                              {conversation.other_user.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                              {new Date(conversation.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-[13px] truncate ${conversation.unread_count > 0 ? "font-medium text-gray-800" : "text-gray-500"}`}>
                            {conversation.last_message_from_me ? "You: " : ""}
                            {conversation.last_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#E4D9CE]/10 relative h-full">
            {/* Tiled background pattern for chat area */}
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://web.telegram.org/a/chat-bg-pattern-light.png')] bg-repeat bg-auto"></div>

            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between px-6 py-3 border-b bg-white/90 backdrop-blur-md z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 shadow-sm">
                      <AvatarImage src={selectedConversation.other_user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-charcoal to-deep-purple text-white">
                        {selectedConversation.other_user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-[16px] font-semibold text-charcoal">
                        {selectedConversation.other_user.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-blue-600">{selectedConversation.subject}</span>
                        <span>•</span>
                        <span>{selectedConversation.other_user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 px-4 md:px-8 z-10">
                  <div className="flex flex-col space-y-2 py-6 min-h-full justify-end max-w-4xl mx-auto">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full flex-col gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-custom-copper" />
                        <span className="text-sm font-medium text-muted-foreground">Syncing messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                        <div className="bg-mustard/10 p-4 rounded-full mb-4">
                          <MessageSquare className="h-12 w-12 text-custom-copper" />
                        </div>
                        <p className="text-lg font-medium text-charcoal">Start the conversation</p>
                        <p className="text-sm text-muted-foreground mt-1">Send a message to break the ice.</p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const showAvatar = !message.is_from_me && (index === 0 || messages[index - 1].is_from_me);
                        return (
                          <div
                            key={message.id}
                            className={`flex w-full ${message.is_from_me ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"}`}
                          >
                            <div className="flex gap-2 max-w-[75%] items-end">
                              {!message.is_from_me && (
                                <div className="w-8 shrink-0 flex flex-col justify-end">
                                  {showAvatar ? (
                                    <Avatar className="h-8 w-8 mb-1 shadow-sm">
                                      <AvatarFallback className="bg-charcoal text-white text-xs">
                                        {selectedConversation.other_user.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ) : <div className="w-8" />}
                                </div>
                              )}
                              <div className="flex flex-col gap-1 relative group">
                                <div
                                  className={`px-3 py-1.5 rounded-xl text-[14px] leading-snug shadow-sm transition-all max-w-full
                                    ${message.is_from_me
                                      ? "bg-[#EEFCD3] text-charcoal rounded-br-sm border border-[#E0EFCC]"
                                      : "bg-white text-charcoal rounded-bl-sm border border-gray-100"
                                    }`}
                                >
                                  <span className="whitespace-pre-wrap break-words">{message.content}</span>
                                  <span className={`inline-flex items-center gap-0.5 ml-3 translate-y-[2px] align-bottom float-right text-[10px] ${message.is_from_me ? "text-[#5EA447]" : "text-gray-400"}`}>
                                    <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {message.is_from_me && (
                                      <span className="text-[11px] tracking-tighter ml-0.5">
                                        {message.is_read ? "✓✓" : "✓"}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messageEndRef} className="h-4" />
                  </div>
                </ScrollArea>

                <div className="p-3 bg-[#F2F2F2] z-10">
                  <div className="flex gap-2 max-w-4xl mx-auto items-end bg-white p-1.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-custom-copper/30 transition-all">
                    <Textarea
                      placeholder="Write a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent py-2.5 px-3 text-[14px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      size="icon"
                      className={`h-9 w-9 shrink-0 rounded-full transition-all duration-300 ${newMessage.trim() ? "bg-[#3390EC] hover:bg-[#3390EC]/90 shadow-md hover:scale-105" : "bg-transparent text-[#3390EC] hover:bg-gray-100"}`}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 z-10">
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-full mb-4 shadow-sm">
                  <MessageSquare className="h-12 w-12 text-[#3390EC] opacity-80" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-500 max-w-sm mb-6 text-sm">
                  Connect with instructors and colleagues instantly.
                </p>
              </div>
            )}
          </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-charcoal to-deep-purple p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">New Message</DialogTitle>
              <DialogDescription className="text-white/70">
                Start a new conversation with a registered user.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4 bg-white">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Recipient Name or Email</label>
              <Input
                placeholder="e.g. instructor@example.com"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                className="rounded-xl bg-gray-50/50 focus-visible:ring-custom-copper"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Subject</label>
              <Input
                placeholder="What's this about?"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="rounded-xl bg-gray-50/50 focus-visible:ring-custom-copper"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Message</label>
              <Textarea
                placeholder="Write your message here..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="min-h-[120px] rounded-xl bg-gray-50/50 focus-visible:ring-custom-copper resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button variant="ghost" className="rounded-xl hover:bg-gray-100" onClick={() => setShowNewConversation(false)}>
                Cancel
              </Button>
              <Button
                onClick={startNewConversation}
                disabled={startingConversation || !newUser || !newSubject || !initialMessage}
                className="rounded-xl bg-custom-copper hover:bg-custom-copper/90 shadow-md"
              >
                {startingConversation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
