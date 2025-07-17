'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ContentGenerationWidget() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setError(null);
      const response = await fetch('/api/content/templates');
      const { templates } = await response.json();
      setTemplates(templates);
    } catch (err) {
      setError('Error loading templates');
    }
  };

  const generateContent = async (templateKey: string) => {
    try {
      setLoading(true);
      setSelectedTemplate(templateKey);
      setError(null);
      setGeneratedContent(null);

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey })
      });

      const result = await response.json();
      setGeneratedContent(result);
    } catch (err) {
      setError('Error generating content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Content Generation</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <Button
              key={template.template_key}
              variant={selectedTemplate === template.template_key ? 'default' : 'outline'}
              onClick={() => generateContent(template.template_key)}
              disabled={loading}
              className="justify-start"
            >
              <span className="mr-2">{template.template_emoji}</span>
              {template.template_name}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Generating content...</p>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm text-center py-2">{error}</div>
        )}

        {generatedContent && generatedContent.success && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Generated Prompt:</h4>
            <pre className="text-sm whitespace-pre-wrap">
              {generatedContent.prompt}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
} 