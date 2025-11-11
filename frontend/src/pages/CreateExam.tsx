
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, { message: "Duration must be at least 5 minutes." }),
  date: z.date({ required_error: "Please select a date." }),
  startTime: z.string().min(1, { message: "Please select a start time." }),
  endTime: z.string().min(1, { message: "Please select an end time." }),
});

type Question = {
  id: string;
  type: "multiple-choice" | "text" | "file-upload";
  text: string;
  options?: string[];
  answer?: string;
  points: number;
};

const CreateExam = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("details");
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      type: "multiple-choice",
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      answer: "Paris",
      points: 5,
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      duration: 60,
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ ...values, questions });
    toast({
      title: "Exam Created",
      description: "Your exam has been successfully created.",
    });
    navigate("/dashboard");
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      type: "multiple-choice",
      text: "",
      options: ["", "", "", ""],
      answer: "",
      points: 5,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length === 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "You must have at least one question.",
      });
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
    
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
  };

  const updateQuestionText = (text: string) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].text = text;
    setQuestions(newQuestions);
  };

  const updateQuestionType = (type: "multiple-choice" | "text" | "file-upload") => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].type = type;
    if (type === "multiple-choice" && !newQuestions[currentQuestionIndex].options) {
      newQuestions[currentQuestionIndex].options = ["", "", "", ""];
    }
    setQuestions(newQuestions);
  };

  const updateOption = (index: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[currentQuestionIndex].options) {
      newQuestions[currentQuestionIndex].options![index] = value;
    }
    setQuestions(newQuestions);
  };

  const updatePoints = (points: number) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].points = points;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (value: string) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].answer = value;
    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-exam-dark">Create New Exam</h1>
            <p className="text-muted-foreground mt-1">
              Set up your exam details and add questions
            </p>
          </div>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="details">Exam Details</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Set the general details for your exam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exam Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Midterm Examination" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="math">Mathematics</SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="history">History</SelectItem>
                                <SelectItem value="computer">Computer Science</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter a description for your exam"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                              How long students will have to complete the exam
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button 
                          type="button" 
                          onClick={() => setCurrentTab("questions")}
                        >
                          Continue to Questions
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="questions">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Question Editor</CardTitle>
                      <CardDescription>
                        Create and organize your exam questions
                      </CardDescription>
                    </div>
                    <Button onClick={addQuestion} className="flex items-center gap-2">
                      <Plus size={16} />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                          disabled={currentQuestionIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                          disabled={currentQuestionIndex === questions.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deleteQuestion(currentQuestionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Question Type</label>
                        <RadioGroup
                          value={questions[currentQuestionIndex].type}
                          onValueChange={(v) => updateQuestionType(v as any)}
                          className="flex space-x-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="multiple-choice" id="mc" />
                            <label htmlFor="mc">Multiple Choice</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="text" id="text" />
                            <label htmlFor="text">Text Answer</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="file-upload" id="file" />
                            <label htmlFor="file">File Upload</label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Question Text</label>
                        <Textarea
                          value={questions[currentQuestionIndex].text}
                          onChange={(e) => updateQuestionText(e.target.value)}
                          placeholder="Enter your question here"
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Points</label>
                        <Input
                          type="number"
                          value={questions[currentQuestionIndex].points}
                          onChange={(e) => updatePoints(parseInt(e.target.value) || 0)}
                          className="mt-2 w-24"
                          min={1}
                        />
                      </div>
                      
                      {questions[currentQuestionIndex].type === "multiple-choice" && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Answer Options</label>
                          
                          {questions[currentQuestionIndex].options?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <RadioGroup
                                value={questions[currentQuestionIndex].answer}
                                onValueChange={setCorrectAnswer}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`option-${idx}`} />
                                </div>
                              </RadioGroup>
                              <Input
                                value={option}
                                onChange={(e) => updateOption(idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {questions[currentQuestionIndex].type === "text" && (
                        <div>
                          <label className="text-sm font-medium">Sample Answer (Optional)</label>
                          <Textarea
                            placeholder="Enter a sample answer for grading reference"
                            className="mt-2"
                          />
                        </div>
                      )}
                      
                      {questions[currentQuestionIndex].type === "file-upload" && (
                        <div>
                          <label className="text-sm font-medium">Allowed File Types</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["PDF", "DOC", "JPG", "PNG"].map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                <input type="checkbox" id={`file-${type}`} className="rounded text-exam-primary" />
                                <label htmlFor={`file-${type}`}>{type}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentTab("details")}
                    >
                      Back to Details
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Exam Saved",
                            description: "Your exam has been saved as draft.",
                          });
                          navigate("/dashboard");
                        }}
                      >
                        Save as Draft
                      </Button>
                      <Button onClick={() => onSubmit(form.getValues())}>
                        Create Exam
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateExam;