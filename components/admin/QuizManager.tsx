// "use client";

// import React, { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Trash2, Edit, Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface Question {
//   id?: string;
//   question: string;
//   options: string[];
//   correctOption: number;
// }

// interface QuizManagerProps {
//   trainingId: string;
// }

// export const QuizManager: React.FC<QuizManagerProps> = ({ trainingId }) => {
//   const { toast } = useToast();

//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [newQuestion, setNewQuestion] = useState<Question>({
//     question: "",
//     options: ["", "", "", ""],
//     correctOption: 0,
//   });
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Fetch existing questions
//   const fetchQuestions = async () => {
//     try {
//       const res = await fetch(`/api/admin/quiz?trainingId=${trainingId}`, {
//         cache: "no-store",
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setQuestions(
//           data.map((q: any) => ({
//             id: q.id,
//             question: q.question_text,
//             options: q.options,
//             correctOption: q.correct_answer_index,
//           }))
//         );
//       } else {
//         throw new Error(data.error || "Failed to fetch questions");
//       }
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error?.message || "Could not fetch questions.",
//         variant: "destructive",
//       });
//     }
//   };

//   useEffect(() => {
//     fetchQuestions();
//   }, [trainingId]);

//   // Save or update question
//   const handleSaveQuestion = async () => {
//     if (!newQuestion.question.trim()) {
//       toast({
//         title: "Validation",
//         description: "Question text is required.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         id: editingIndex !== null ? questions[editingIndex].id : undefined,
//         training_id: trainingId,
//         question_text: newQuestion.question,
//         options: newQuestion.options,
//         correct_answer_index: newQuestion.correctOption,
//       };

//       const method = editingIndex !== null ? "PUT" : "POST";

//       const res = await fetch("/api/admin/quiz", {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to save question");

//       toast({ title: "Success", description: "Question saved." });
//       setNewQuestion({
//         question: "",
//         options: ["", "", "", ""],
//         correctOption: 0,
//       });
//       setEditingIndex(null);
//       fetchQuestions();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error?.message || "Could not save question.",
//         variant: "destructive",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Edit question
//   const handleEditQuestion = (index: number) => {
//     setEditingIndex(index);
//     setNewQuestion(questions[index]);
//   };

//   // Delete question
//   const handleDeleteQuestion = async (id?: string) => {
//     if (!id) return;
//     if (!confirm("Are you sure you want to delete this question?")) return;

//     try {
//       const res = await fetch(`/api/admin/quiz?id=${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to delete question");
//       toast({ title: "Deleted", description: "Question deleted." });
//       fetchQuestions();
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error?.message || "Could not delete question.",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h4 className="text-lg font-semibold">
//         {editingIndex !== null ? "Edit Question" : "Add New Question"}
//       </h4>

//       {/* Question Form */}
//       <div className="space-y-2">
//         <div>
//           <label className="block text-sm font-medium">Question Text</label>
//           <Textarea
//             value={newQuestion.question}
//             onChange={(e) =>
//               setNewQuestion({ ...newQuestion, question: e.target.value })
//             }
//             rows={3}
//             disabled={submitting}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           {newQuestion.options.map((option, idx) => (
//             <div key={idx}>
//               <label className="block text-sm font-medium">
//                 Option {idx + 1}
//               </label>
//               <Input
//                 value={option}
//                 onChange={(e) => {
//                   const updatedOptions = [...newQuestion.options];
//                   updatedOptions[idx] = e.target.value;
//                   setNewQuestion({ ...newQuestion, options: updatedOptions });
//                 }}
//                 disabled={submitting}
//               />
//             </div>
//           ))}
//         </div>

//         <div>
//           <label className="block text-sm font-medium">
//             Correct Option (0-3)
//           </label>
//           <Input
//             type="number"
//             min={0}
//             max={3}
//             value={newQuestion.correctOption}
//             onChange={(e) =>
//               setNewQuestion({
//                 ...newQuestion,
//                 correctOption: Number(e.target.value),
//               })
//             }
//             disabled={submitting}
//           />
//         </div>

//         <div className="flex gap-2">
//           <Button
//             type="button"
//             className="bg-mustard text-ivory"
//             onClick={handleSaveQuestion}
//             disabled={submitting}
//           >
//             {submitting ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               "Save Question"
//             )}
//           </Button>
//           {editingIndex !== null && (
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 setEditingIndex(null);
//                 setNewQuestion({
//                   question: "",
//                   options: ["", "", "", ""],
//                   correctOption: 0,
//                 });
//               }}
//               disabled={submitting}
//             >
//               Cancel
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Questions List */}
//       <div className="mt-4">
//         {questions.length === 0 ? (
//           <p className="text-sm text-muted-foreground">
//             No questions added yet.
//           </p>
//         ) : (
//           <div className="space-y-2">
//             {questions.map((q, idx) => (
//               <div
//                 key={q.id || idx}
//                 className="border rounded p-3 flex justify-between items-start"
//               >
//                 <div>
//                   <p className="font-medium">{q.question}</p>
//                   <ul className="list-disc pl-5 text-sm">
//                     {q.options.map((opt, i) => (
//                       <li key={i}>
//                         {opt}{" "}
//                         {i === q.correctOption && <strong>(Correct)</strong>}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handleEditQuestion(idx)}
//                   >
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     size="icon"
//                     onClick={() => handleDeleteQuestion(q.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id?: string;
  question: string;
  options: string[];
  correctOption: number;
}

interface QuizManagerProps {
  trainingId: string;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ trainingId }) => {
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  // State for adding a new question (top form)
  const [newQuestionForm, setNewQuestionForm] = useState<Question>({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
  });
  // State for inline editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editedQuestionData, setEditedQuestionData] = useState<Question | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing questions
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/quiz?trainingId=${trainingId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(
          data.map((q: any) => ({
            id: q.id,
            question: q.question_text,
            options: q.options,
            correctOption: q.correct_answer_index,
          }))
        );
      } else {
        throw new Error(data.error || "Failed to fetch questions");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Could not fetch questions.",
        variant: "destructive",
      });
    }
  }, [trainingId, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // --- Handlers for Adding New Questions (Top Form) ---
  const handleNewQuestionFormChange = (
    field: keyof Question | `option-${number}` | "correctOption",
    value: any
  ) => {
    if (field === "question") {
      setNewQuestionForm({ ...newQuestionForm, question: value });
    } else if (field.startsWith("option-")) {
      const index = parseInt(field.split("-")[1]);
      const updatedOptions = [...newQuestionForm.options];
      updatedOptions[index] = value;
      setNewQuestionForm({ ...newQuestionForm, options: updatedOptions });
    } else if (field === "correctOption") {
      setNewQuestionForm({
        ...newQuestionForm,
        correctOption: parseInt(value),
      });
    }
  };

  const handleAddNewQuestion = async () => {
    // Removed 'e: React.FormEvent' as it's now an onClick
    if (!newQuestionForm.question.trim()) {
      toast({
        title: "Validation",
        description: "Question text is required.",
        variant: "destructive",
      });
      return;
    }
    if (newQuestionForm.options.some((opt) => !opt.trim())) {
      toast({
        title: "Validation",
        description: "All options must be filled.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        training_id: trainingId,
        question_text: newQuestionForm.question,
        options: newQuestionForm.options,
        correct_answer_index: newQuestionForm.correctOption,
      };

      const res = await fetch("/api/admin/quiz", {
        method: "POST", // Always POST for new questions
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add new question");

      toast({ title: "Success", description: "Question added successfully." });
      setNewQuestionForm({
        // Reset form
        question: "",
        options: ["", "", "", ""],
        correctOption: 0,
      });
      fetchQuestions(); // Re-fetch to update the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Could not add new question.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers for Inline Editing Existing Questions ---
  const startEditingInline = (question: Question) => {
    setEditingQuestionId(question.id || null);
    // Create a deep copy to avoid direct mutation
    setEditedQuestionData(JSON.parse(JSON.stringify(question)));
  };

  const handleInlineEditChange = (
    field: keyof Question | `option-${number}` | "correctOption",
    value: any
  ) => {
    if (!editedQuestionData) return;

    if (field === "question") {
      setEditedQuestionData({ ...editedQuestionData, question: value });
    } else if (field.startsWith("option-")) {
      const index = parseInt(field.split("-")[1]);
      const updatedOptions = [...editedQuestionData.options];
      updatedOptions[index] = value;
      setEditedQuestionData({ ...editedQuestionData, options: updatedOptions });
    } else if (field === "correctOption") {
      setEditedQuestionData({
        ...editedQuestionData,
        correctOption: parseInt(value),
      });
    }
  };

  const handleSaveInlineEdit = async () => {
    if (!editedQuestionData || !editedQuestionData.id) {
      toast({
        title: "Error",
        description: "No question selected for edit or missing ID.",
        variant: "destructive",
      });
      return;
    }
    if (!editedQuestionData.question.trim()) {
      toast({
        title: "Validation",
        description: "Question text is required.",
        variant: "destructive",
      });
      return;
    }
    if (editedQuestionData.options.some((opt) => !opt.trim())) {
      toast({
        title: "Validation",
        description: "All options must be filled.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: editedQuestionData.id,
        training_id: trainingId,
        question_text: editedQuestionData.question,
        options: editedQuestionData.options,
        correct_answer_index: editedQuestionData.correctOption,
      };

      const res = await fetch("/api/admin/quiz", {
        method: "PUT", // Always PUT for updating existing questions
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update question");

      toast({
        title: "Success",
        description: "Question updated successfully.",
      });
      setEditingQuestionId(null); // Exit edit mode
      setEditedQuestionData(null); // Clear temporary data
      fetchQuestions(); // Re-fetch to update the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Could not update question.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInlineEdit = () => {
    setEditingQuestionId(null);
    setEditedQuestionData(null);
  };

  // Delete question
  const handleDeleteQuestion = async (id?: string) => {
    if (!id) return;
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/quiz?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete question");
      toast({ title: "Deleted", description: "Question deleted." });
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Could not delete question.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Add New Question</h4>

      {/* Form for adding new questions - CHANGED TO DIV */}
      <div className="space-y-2 border p-4 rounded-lg bg-gray-50">
        <div>
          <label className="block text-sm font-medium">Question Text</label>
          <Textarea
            value={newQuestionForm.question}
            onChange={(e) =>
              handleNewQuestionFormChange("question", e.target.value)
            }
            rows={3}
            disabled={submitting}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {newQuestionForm.options.map((option, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium">
                Option {idx + 1}
              </label>
              <Input
                value={option}
                onChange={(e) =>
                  handleNewQuestionFormChange(`option-${idx}`, e.target.value)
                }
                disabled={submitting}
                required
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Correct Option (0-3)
          </label>
          <Input
            type="number"
            min={0}
            max={3}
            value={newQuestionForm.correctOption}
            onChange={(e) =>
              handleNewQuestionFormChange("correctOption", e.target.value)
            }
            disabled={submitting}
            required
          />
        </div>

        <Button
          type="button" // CHANGED TO type="button"
          className="bg-mustard text-ivory"
          onClick={handleAddNewQuestion} // ADDED onClick handler
          disabled={submitting || editingQuestionId !== null}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Question"
          )}
        </Button>
      </div>

      {/* Questions List */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold">Existing Questions</h4>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="border rounded p-3 flex justify-between items-start bg-white shadow-sm"
              >
                {editingQuestionId === q.id && editedQuestionData ? (
                  // --- Inline Edit Mode ---
                  <div className="flex-grow space-y-2">
                    <div>
                      <label className="block text-sm font-medium">
                        Question Text
                      </label>
                      <Textarea
                        value={editedQuestionData.question}
                        onChange={(e) =>
                          handleInlineEditChange("question", e.target.value)
                        }
                        rows={3}
                        disabled={submitting}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {editedQuestionData.options.map((option, idx) => (
                        <div key={idx}>
                          <label className="block text-sm font-medium">
                            Option {idx + 1}
                          </label>
                          <Input
                            value={option}
                            onChange={(e) =>
                              handleInlineEditChange(
                                `option-${idx}`,
                                e.target.value
                              )
                            }
                            disabled={submitting}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Correct Option (0-3)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={3}
                        value={editedQuestionData.correctOption}
                        onChange={(e) =>
                          handleInlineEditChange(
                            "correctOption",
                            e.target.value
                          )
                        }
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        className="bg-mustard text-ivory"
                        onClick={handleSaveInlineEdit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelInlineEdit}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // --- Display Mode ---
                  <div className="flex-grow">
                    <p className="font-medium">{q.question}</p>
                    <ul className="list-disc pl-5 text-sm">
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          {opt}{" "}
                          {i === q.correctOption && <strong>(Correct)</strong>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {editingQuestionId !== q.id && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => startEditingInline(q)}
                      disabled={submitting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={submitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
