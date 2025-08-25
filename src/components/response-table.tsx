'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type WebhookResponse = {
  chapter_name: string[];
  question_type: string[];
  difficulty_name?: string[];
  source_link: string[];
  question_number: number[];
};

interface ResponseTableProps {
  responseData: WebhookResponse[];
}

export function ResponseTable({ responseData }: ResponseTableProps) {
  if (!responseData || responseData.length === 0) {
    return null;
  }

  const data = responseData[0];
  const rowCount = data.chapter_name?.length || 0;

  if (rowCount === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Curated Test Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Received an empty data set from the webhook.</p>
        </CardContent>
      </Card>
    );
  }

  // Transform the column-oriented data into an array of row objects
  const transformedData = Array.from({ length: rowCount }, (_, i) => ({
    chapter_name: data.chapter_name[i],
    question_type: data.question_type[i],
    // difficulty_name may be optional depending on webhook shape
    difficulty_name: data.difficulty_name ? data.difficulty_name[i] : undefined,
    source_link: data.source_link[i],
    question_number: data.question_number[i],
  }));

  return (
    <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Curated Test Details</CardTitle>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chapter Name</TableHead>
              <TableHead>Question Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Source Link</TableHead>
              <TableHead>Question Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.chapter_name}</TableCell>
                <TableCell>{item.question_type}</TableCell>
                <TableCell>{item.difficulty_name ?? '-'}</TableCell>
                <TableCell>
                  <a
                    href={item.source_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline"
                  >
                    View Source
                  </a>
                </TableCell>
                <TableCell>{item.question_number}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
