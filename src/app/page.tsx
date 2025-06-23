import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Buildla AI Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Create intelligent AI assistants for your Squarespace website. 
            Generate quotes, handle customer inquiries, and grow your business automatically.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 cursor-pointer">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-600">Smart Assistants</CardTitle>
              <CardDescription>
                Create AI assistants that understand your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Build custom AI assistants with specific knowledge about your services, 
                pricing, and business processes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-600">Automated Quotes</CardTitle>
              <CardDescription>
                Generate accurate quotes instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your AI assistant can calculate complex pricing, apply discounts, 
                and generate professional quotes in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-purple-600">Easy Integration</CardTitle>
              <CardDescription>
                Embed anywhere with simple code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get a simple code snippet to embed your AI chat widget 
                on any Squarespace page or website.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Built with Next.js, OpenAI, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
