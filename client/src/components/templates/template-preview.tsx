import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailTemplate } from "@shared/schema";

interface TemplatePreviewProps {
  template: EmailTemplate;
  onClose: () => void;
}

export default function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  return (
    <>
      <DialogHeader className="border-b pb-4 mb-4">
        <div className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">
            Template Preview: {template.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <div className="overflow-auto" style={{ height: "calc(85vh - 100px)" }}>
        <div className="flex flex-col gap-4">
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="font-medium text-muted-foreground">From:</div>
              <div>{template.sender_name} &lt;{template.sender_email}&gt;</div>
              
              <div className="font-medium text-muted-foreground">Subject:</div>
              <div>{template.subject}</div>
              
              <div className="font-medium text-muted-foreground">Type:</div>
              <div>Standard - Medium</div>
            </div>
          </div>
          
          <div className="border rounded-md p-3 bg-white">
            <div 
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: template.html_content || 'No content available' }}
            />
          </div>
          
          {template.text_content && (
            <div className="border rounded-md p-3 mt-4">
              <h3 className="text-sm font-medium mb-2">Plain Text Version:</h3>
              <pre className="whitespace-pre-wrap text-sm">{template.text_content}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}