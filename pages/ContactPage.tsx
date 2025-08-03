
import React, { useState } from 'react';
import Alert from '../components/Alert';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        setError("Please fill in all fields.");
        return;
    }
    if (!formData.email.includes('@')) {
        setError("Please enter a valid email address.");
        return;
    }
    setError(null);
    // Mock submission
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
     setTimeout(() => setSubmitted(false), 5000); // Reset submitted state after 5s
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-sky-300">Get In Touch</h1>
        <p className="text-lg text-gray-400 mt-2">We'd love to hear from you! Send us a message.</p>
      </header>

      <div className="bg-slate-800 shadow-xl rounded-lg p-8">
        {submitted && <Alert type="success" message="Thank you for your message! We'll get back to you soon." onClose={() => setSubmitted(false)} />}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-sky-300">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sky-300">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-sky-300">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-sky-300">Message</label>
              <textarea
                name="message"
                id="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-md text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-10 text-center">
            <h3 className="text-lg font-medium text-sky-300">Other ways to reach us:</h3>
            <p className="text-gray-400 mt-2">Email: <a href="mailto:support@careercompasshub.dev" className="text-sky-400 hover:underline">support@careercompasshub.dev</a></p>
            <p className="text-gray-400">Phone: (555) 123-4567 (Mon-Fri, 9am-5pm EST)</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
