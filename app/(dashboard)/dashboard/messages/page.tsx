"use client";

import { useState, useEffect } from "react";
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

  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setError(null);
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
        const errorData = await response.json();
        setError(
          errorData.details || errorData.error || "Failed to load conversations"
        );
        toast.error(errorData.error || "Failed to load conversations");
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      setError("Network error: Unable to connect to server");
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/student/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        fetchConversations();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to load messages");
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

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
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        await fetchMessages(selectedConversation.id);
        toast.success("Message sent");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
    <>
      <div className="px-6 pt-6">
        <DashboardHeader heading="Dashboard" text="Messages" />
      </div>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with your instructors and colleagues
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                {totalUnread} unread
              </Badge>
            )}
            <Button onClick={() => setShowNewConversation(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3 h-[600px]">
          {/* Conversations List */}
          <Card className="flex flex-col overflow-hidden rounded-xl shadow-sm border">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-4 w-4" />
                Conversations ({conversations.length})
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-full p-2 rounded-b-xl">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p className="mb-2">No conversations found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewConversation(true)}
                    >
                      Start a conversation
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`
                      p-4 rounded-lg cursor-pointer mb-2 
                      transition-colors border border-transparent
                      hover:bg-muted/70
                      ${selectedConversation?.id === conversation.id ? "bg-muted" : ""}
                      ${conversation.unread_count > 0 ? "border-l-4 border-primary" : ""}
                    `}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        fetchMessages(conversation.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                conversation.other_user.avatar ||
                                "/placeholder.svg"
                              }
                            />
                            <AvatarFallback>
                              {conversation.other_user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm truncate ${
                                conversation.unread_count > 0
                                  ? "font-semibold"
                                  : "font-medium"
                              }`}
                            >
                              {conversation.other_user.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              {conversation.unread_count > 0 ? (
                                <Mail className="h-3 w-3 text-destructive" />
                              ) : (
                                <MailOpen className="h-3 w-3 text-muted-foreground" />
                              )}
                              {conversation.unread_count > 0 && (
                                <Badge
                                  variant="destructive"
                                  className="h-4 w-4 p-0 text-xs"
                                >
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {conversation.subject}
                          </p>
                          <p
                            className={`text-xs truncate mt-1 ${
                              conversation.unread_count > 0
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {conversation.last_message_from_me ? "You: " : ""}
                            {conversation.last_message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conversation.time_ago}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="flex flex-col overflow-hidden rounded-xl shadow-sm border md:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="bg-muted/50 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          selectedConversation.other_user.avatar ||
                          "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        {selectedConversation.other_user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.other_user.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {selectedConversation.subject} •{" "}
                        {selectedConversation.other_user.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="h-[400px] p-4 space-y-4 flex-1">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Loading messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.is_from_me ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.is_from_me
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                              {/* <span>{message.time_ago}</span> */}
                              {message.is_from_me && (
                                <span>{message.is_read ? "Read" : "Sent"}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                  <div className="border-t p-4 bg-background">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none"
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
                        className="self-end"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Select a Conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the left to start messaging.
                </p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* New Conversation Dialog */}
        <Dialog
          open={showNewConversation}
          onOpenChange={setShowNewConversation}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
              <DialogDescription>
                Send a message to any registered user in the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  User Name or Email
                </label>
                <Input
                  placeholder="Enter user name or email address"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="What's this conversation about?"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your initial message..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewConversation(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={startNewConversation}
                  disabled={startingConversation}
                >
                  {startingConversation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    "Start Conversation"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
