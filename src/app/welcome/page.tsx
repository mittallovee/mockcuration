'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef } from 'react';
import { Loader2, PlusCircle, XCircle, AlertCircle } from 'lucide-react';
import { ResponseTable } from '@/components/response-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type QuestionRow = {
  id: number;
  class: string;
  chapter: string;
  questionType: string;
  questionCount: string;
};

// This type now represents the new structure from the webhook
type WebhookResponse = {
  chapter_name: string[];
  question_type: string[];
  source_link: string[];
  question_number: number[];
};


const chaptersByClass: Record<string, string[]> = {
    '11': [
      'Mathematical Tools and Vectors',
      'Units and Measurements',
      'Motion in a Straight Line',
      'Motion in a Plane',
      'Laws of Motion',
      'Work Energy and Power',
      'Circular Motion',
      'Center of Mass and System of Particles',
      'Rotational Motion',
      'Gravitation',
      'Mechanical Properties of Solids',
      'Mechanical Properties of Fluids',
      'Thermal Properties of Matter',
      'Kinetic Theory',
      'Thermodynamics',
      'Oscillations',
      'Waves',
    ],
    '12': [
      'Electric Charges and Fields',
      'Electrostatic Potential and Capacitance',
      'Current Electricity',
      'Moving Charges and Magnetism',
      'Magnetism and Matter',
      'Electromagnetic Induction',
      'Alternating Current',
      'Electromagnetic Waves',
      'Ray Optics and Optical Instruments',
      'Wave Optics',
      'Dual Nature of Radiation and Matter',
      'Atoms',
      'Nuclei',
      'Semiconductor Electronics: Materials, Devices and Simple Circuits',
    ],
  };

const questionTypes = [
    'Single Option Correct',
    'Multiple Option Correct',
    'Single Digit Integer',
    'Integer',
    'Numerical',
    'List Type',
    'Passage',
];

export default function WelcomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<WebhookResponse[] | null>(null);
  const [testName, setTestName] = useState('');
  const nextId = useRef(1);

  const [rows, setRows] = useState<QuestionRow[]>([
    { id: nextId.current++, class: '', chapter: '', questionType: '', questionCount: '' },
  ]);

  const webhookUrl = 'https://n8n.lovee.info/webhook/curation';

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [name]: value };
    setRows(newRows);
  };

  const handleSelectChange = (index: number, name: 'class' | 'chapter' | 'questionType', value: string) => {
    const newRows = [...rows];
    const oldClass = newRows[index].class;
    newRows[index] = { ...newRows[index], [name]: value };
    // If class is changed, reset the chapter
    if (name === 'class' && oldClass !== value) {
        newRows[index].chapter = '';
    }
    setRows(newRows);
  };

  const addRow = () => {
    setRows(prevRows => [
      ...prevRows,
      { id: nextId.current++, class: '', chapter: '', questionType: '', questionCount: '' },
    ]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
    }
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const payload = {
      testName,
      questions: rows,
    };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const responseText = await res.text();
      if (!responseText) {
          throw new Error('Received an empty response from the webhook.');
      }

      const responseData = JSON.parse(responseText);
      setResponse(responseData);

    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to submit form: ${e.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <Card className="w-full max-w-4xl animate-fade-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Curation for Mock Real Test
          </CardTitle>
          <CardDescription>
            Provide the chapters, type of questions and number of questions needed to curate a test paper.
            The curated test paper will be visible in the{' '}
            <a
              href="https://docs.google.com/spreadsheets/d/1Jn2Htw8hpvQS68ccA_h-nRhZKMLU7InkOWHGfe7ET2M/edit?gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              sheetLink
            </a>
            .
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
                <Label htmlFor="testName" className="whitespace-nowrap">Test Name</Label>
                <Input 
                    id="testName"
                    placeholder="MockRealTest_12th_31Aug"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                />
            </div>
            <div className="hidden md:grid grid-cols-[0.5fr_1fr_1fr_1fr_auto] gap-4 items-center text-center font-medium text-muted-foreground">
              <Label>Class</Label>
              <Label>Chapter</Label>
              <Label>Type of question</Label>
              <Label>No of Question</Label>
              <div /> 
            </div>
            <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-1 md:grid-cols-[0.5fr_1fr_1fr_1fr_auto] gap-4 items-center">
                {/* Mobile Class */}
                <div className="space-y-1 md:hidden">
                    <Label htmlFor={`class-${row.id}`}>Class</Label>
                     <Select value={row.class} onValueChange={(value) => handleSelectChange(index, 'class', value)}>
                        <SelectTrigger id={`class-${row.id}`}>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="11">11</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Desktop Class */}
                 <Select value={row.class} onValueChange={(value) => handleSelectChange(index, 'class', value)}>
                    <SelectTrigger className="hidden md:flex" aria-label="Class">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                </Select>

                {/* Mobile Chapter */}
                <div className="space-y-1 md:hidden">
                    <Label htmlFor={`chapter-${row.id}`}>Chapter</Label>
                    <Select value={row.chapter} onValueChange={(value) => handleSelectChange(index, 'chapter', value)} disabled={!row.class}>
                        <SelectTrigger id={`chapter-${row.id}`}>
                            <SelectValue placeholder={row.class ? "Select Chapter" : "Select Class First"} />
                        </SelectTrigger>
                        <SelectContent>
                           {(chaptersByClass[row.class] || []).map((chapter) => (
                                <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Desktop Chapter */}
                 <Select value={row.chapter} onValueChange={(value) => handleSelectChange(index, 'chapter', value)} disabled={!row.class}>
                    <SelectTrigger className="hidden md:flex" aria-label="Chapter">
                        <SelectValue placeholder={row.class ? "Select Chapter" : "Select Class First"} />
                    </SelectTrigger>
                    <SelectContent>
                         {(chaptersByClass[row.class] || []).map((chapter) => (
                                <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                           ))}
                    </SelectContent>
                </Select>

                {/* Mobile Question Type */}
                 <div className="space-y-1 md:hidden">
                    <Label htmlFor={`questionType-${row.id}`}>Type of question</Label>
                    <Select value={row.questionType} onValueChange={(value) => handleSelectChange(index, 'questionType', value)}>
                        <SelectTrigger id={`questionType-${row.id}`}>
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                           {questionTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Desktop Question Type */}
                <Select value={row.questionType} onValueChange={(value) => handleSelectChange(index, 'questionType', value)}>
                    <SelectTrigger className="hidden md:flex" aria-label="Type of question">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {questionTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {/* Mobile Question Count */}
                <div className="space-y-1 md:hidden">
                    <Label htmlFor={`questionCount-${row.id}`}>No of Question</Label>
                    <Input id={`questionCount-${row.id}`} name="questionCount" type="number" placeholder="e.g., 10" value={row.questionCount} onChange={(e) => handleInputChange(index, e)}/>
                </div>
                {/* Desktop Question Count */}
                <Input className="hidden md:block" name="questionCount" type="number" placeholder="e.g., 10" value={row.questionCount} onChange={(e) => handleInputChange(index, e)} aria-label="No of Question"/>

                <Button variant="ghost" size="icon" type="button" onClick={() => removeRow(index)} disabled={rows.length <= 1} className="text-muted-foreground hover:text-destructive">
                  <XCircle className="h-5 w-5" />
                  <span className="sr-only">Remove row</span>
                </Button>
              </div>
            ))}
            </div>
             <Button variant="outline" type="button" onClick={addRow} className="w-full mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
             <Button type="submit" className="w-1/2" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive" className="w-full max-w-4xl mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && Array.isArray(response) && (
        <div className="w-full max-w-4xl mt-8">
          <ResponseTable responseData={response} />
        </div>
      )}
    </main>
  );
}
