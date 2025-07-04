// src/pages/signup.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useNavigate } from 'react-router-dom';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1 , 'Username is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  password: z.string().min(6 ,'Password must be at least 6 characters'),
  role: z.enum(['admin', 'analyst']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: 'analyst',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
  try {
    const response = await apiRequest("POST", "/api/auth/signup", {
      name: values.name,
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role,
    });

    if (response.ok) {
      toast({
        title: "Signup successful",
        description: "You can now log in with your credentials.",
      });
      navigate("/login"); // Redirect to login
    } else {
      const data = await response.json();
      toast({
        title: "Signup failed",
        description: data.message || "Something went wrong",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    toast({
      title: "Error",
      description: "Unexpected error occurred.",
      variant: "destructive",
    });
  }
};


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
      <input {...form.register("name")} placeholder="Full Name" />
      <input {...form.register("username")} placeholder="Username" />
      <input {...form.register("email")} placeholder="Email" />
      <input {...form.register("password")} placeholder="Password" type="password" />
      <select {...form.register("role")}>
        <option value="analyst">Analyst</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Create Account</button>
    </form>
  );
}
