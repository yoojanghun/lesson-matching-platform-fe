'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../components/UserContext';
import { GraduationCap, Award, ArrowLeft, ArrowRight, Check, UserCheck, ShieldCheck, Mail, Lock, User, DollarSign, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

type SignUpStep = 'CHOOSE_ROLE' | 'FILL_FORM';
type TargetRole = 'STUDENT' | 'TUTOR';

export default function SignUpPage() {
  const router = useRouter();
  const { setRole } = useUser();
  
  // Step State
  const [step, setStep] = useState<SignUpStep>('CHOOSE_ROLE');
  const [selectedRole, setSelectedRole] = useState<TargetRole | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Tutor Specific Fields
  const [subject, setSubject] = useState('English');
  const [price, setPrice] = useState(30);
  const [education, setEducation] = useState('');

  const handleRoleSelect = (role: TargetRole) => {
    setSelectedRole(role);
    setStep('FILL_FORM');
  };

  const handleBackToRoles = () => {
    setStep('CHOOSE_ROLE');
    setSelectedRole(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill out all required fields.');
      return;
    }

    // Set the user's role globally
    if (selectedRole) {
      setRole(selectedRole);
      
      // Store dummy profile data
      const dummyProfile = {
        name,
        email,
        role: selectedRole,
        ...(selectedRole === 'TUTOR' ? { subject, price, education } : {})
      };
      localStorage.setItem('tm_profile', JSON.stringify(dummyProfile));

      // Route based on role
      if (selectedRole === 'STUDENT') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-8">
        
        {/* Step 1: Choose Role */}
        {step === 'CHOOSE_ROLE' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Account</h1>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Select your account type to get started on the lesson matching platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Role Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
                className="group border border-slate-200 hover:border-blue-500 hover:ring-2 hover:ring-blue-500/10 p-6 rounded-2xl text-left bg-white transition-all duration-300 flex flex-col justify-between h-64 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-400 cursor-pointer hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 group-hover:scale-105 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                    Join as Student
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Find professional tutors, send matching requests, and write reviews to track your learning.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                  <span>Start Learning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>

              {/* Tutor Role Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('TUTOR')}
                className="group border border-slate-200 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/10 p-6 rounded-2xl text-left bg-white transition-all duration-300 flex flex-col justify-between h-64 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-400 cursor-pointer hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                    Join as Tutor
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Set your custom rates, accept student lessons, verify your credentials, and tutor online.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:gap-2.5 transition-all">
                  <span>Start Teaching</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Fill Sign Up Form */}
        {step === 'FILL_FORM' && selectedRole && (
          <div className="space-y-6">
            <button
              onClick={handleBackToRoles}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change account type
            </button>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Create {selectedRole === 'STUDENT' ? 'Student' : 'Tutor'} Profile
              </h2>
              <p className="text-xs text-slate-500 mt-1">Complete your registration to unlock dashboard features.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Email address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* TUTOR Specific Fields */}
                {selectedRole === 'TUTOR' && (
                  <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                    <span className="block text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                      Tutor Details
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Subject selection */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                          Primary Subject
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                        >
                          <option value="English">English</option>
                          <option value="Math">Math</option>
                          <option value="Science">Science</option>
                          <option value="Programming">Programming</option>
                          <option value="Music">Music</option>
                          <option value="Art">Art</option>
                        </select>
                      </div>

                      {/* Hourly Rate */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                          Hourly Rate ($)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                          <input
                            type="number"
                            required
                            min={10}
                            max={200}
                            value={price}
                            onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Education summary */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 dark:text-slate-400">
                        Education Summary
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. B.S. in Mathematics, Stanford University"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-850 dark:border-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className={clsx(
                  "w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-6 flex items-center justify-center gap-1.5 cursor-pointer",
                  selectedRole === 'STUDENT'
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                    : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                )}
              >
                <UserCheck className="h-4 w-4" />
                <span>Complete Registration</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
