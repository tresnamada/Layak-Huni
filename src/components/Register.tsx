"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    console.log('Registration attempt with:', { fullName, email, password })
  }

  return (
    <section className='min-h-screen flex items-center justify-center bg-[#EAF4DE] p-4'>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-xl shadow-xl overflow-hidden'
      >
        {/* Left side - Image */}
        <motion.div 
          className='w-full md:w-1/2 relative h-64 md:h-auto'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-full h-full">
            <Image 
              src="/pacarelang.jpg" 
              alt="SiapHuni Register" 
              fill
              style={{ objectFit: 'cover' }}
              priority
              className="rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
            />
            <div className="absolute inset-0 bg-[#594C1A]/40 flex items-center justify-center">
              <motion.div 
                className="text-white text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-3xl font-bold mb-2">SiapHuni</h1>
                <p className="text-lg">Join SiapHuni Sekarang</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Register Form */}
        <div className='w-full md:w-1/2'>
          <div className='p-6 bg-[#594C1A] text-white'>
            <motion.h2 
              className='text-2xl font-bold text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Create Account
            </motion.h2>
            <p className='text-center text-[#EAF4DE]/80 mt-1'>Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-4'>
            <motion.div 
              className='space-y-2'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor='fullName' className='block text-sm font-medium text-[#594C1A]'>
                Full Name
              </label>
              <input
                type='text'
                id='fullName'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='w-full px-3 py-2 border border-[#938656]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]'
                required
              />
            </motion.div>

            <motion.div 
              className='space-y-2'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor='email' className='block text-sm font-medium text-[#594C1A]'>
                Email
              </label>
              <input
                type='email'
                id='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-3 py-2 border border-[#938656]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]'
                required
              />
            </motion.div>

            <motion.div 
              className='space-y-2'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor='password' className='block text-sm font-medium text-[#594C1A]'>
                Password
              </label>
              <input
                type='password'
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-3 py-2 border border-[#938656]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]'
                required
              />
            </motion.div>

            <motion.div 
              className='space-y-2'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor='confirmPassword' className='block text-sm font-medium text-[#594C1A]'>
                Confirm Password
              </label>
              <input
                type='password'
                id='confirmPassword'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full px-3 py-2 border border-[#938656]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#938656]'
                required
              />
            </motion.div>

            <div className='flex items-center'>
              <input
                id='terms'
                name='terms'
                type='checkbox'
                className='h-4 w-4 text-[#938656] focus:ring-[#938656] border-[#938656]/30 rounded'
                required
              />
              <label htmlFor='terms' className='ml-2 block text-sm text-gray-700'>
                I agree to the <a href='#' className='text-[#938656] hover:text-[#594C1A]'>Terms and Conditions</a>
              </label>
            </div>

            <motion.button
              type='submit'
              className='w-full bg-[#938656] text-white py-2 px-4 rounded-md hover:bg-[#594C1A] transition-colors'
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>

            <div className='text-center mt-4'>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link href='/login' className='font-medium text-[#938656] hover:text-[#594C1A]'>
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  )
}

export default Register