import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["teacher", "student"], { required_error: "Please select a role." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const Login = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  });
  
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    console.log("Login:", values);
    
    // Get users from localStorage
    const usersStr = localStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    // Check if user exists
    if (!users[values.email]) {
      toast({
        title: "Login Failed",
        description: "Email not registered. Please sign up first.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you'd check the password hash
    if (users[values.email].password !== values.password) {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Store user info in localStorage for tracking
    localStorage.setItem('userEmail', values.email);
    localStorage.setItem('userName', users[values.email].name);
    localStorage.setItem('userRole', users[values.email].role);
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${users[values.email].name}!`,
    });
    
    // Navigate based on role
    if (users[values.email].role === "teacher") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard");
    }
  };
  
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    console.log("Register:", values);
    
    // Get existing users
    const usersStr = localStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) : {};
    
    // Check if email is already registered
    if (users[values.email]) {
      toast({
        title: "Registration Failed",
        description: "Email already registered. Please use a different email or log in.",
        variant: "destructive",
      });
      return;
    }
    
    // Store new user (in a real app, you'd hash the password)
    users[values.email] = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store user info in localStorage for tracking
    localStorage.setItem('userEmail', values.email);
    localStorage.setItem('userName', values.name);
    localStorage.setItem('userRole', values.role);
    
    toast({
      title: "Registration Successful",
      description: "Your account has been created.",
    });
    
    // Navigate to dashboard
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4 bg-gradient-to-b from-slate-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600/10 to-teal-700/10 rounded-xl mb-6">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to InteGriGuard</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Secure online examination platform
            </p>
          </div>
          
          <Card className="border-0 shadow-md">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full bg-slate-100 p-1 rounded-t-lg">
                <TabsTrigger 
                  value="login" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-none"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-none"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-900">Login to Your Account</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 text-sm">Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-slate-700 text-sm">Password</FormLabel>
                              <a href="#" className="text-xs text-emerald-600 hover:text-emerald-800">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium mt-6"
                      >
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center pt-0 pb-6 border-t-0">
                  <div className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </div>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-slate-900">Create an Account</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    Join InteGriGuard to create or take exams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 text-sm">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John Doe" 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 text-sm">Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 text-sm">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 text-sm">Confirm</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 text-sm">I am a</FormLabel>
                            <div className="flex gap-3 mt-1">
                              <Button
                                type="button"
                                variant={field.value === "teacher" ? "default" : "outline"}
                                className={`flex-1 rounded-md ${field.value === "teacher" ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                onClick={() => registerForm.setValue("role", "teacher")}
                              >
                                Teacher
                              </Button>
                              <Button
                                type="button"
                                variant={field.value === "student" ? "default" : "outline"}
                                className={`flex-1 rounded-md ${field.value === "student" ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                                onClick={() => registerForm.setValue("role", "student")}
                              >
                                Student
                              </Button>
                            </div>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium mt-6"
                      >
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center pt-0 pb-6 border-t-0">
                  <div className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </div>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;