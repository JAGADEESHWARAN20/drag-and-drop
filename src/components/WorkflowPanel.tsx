
import React, { useState } from 'react';
import { 
  Circle,
  ArrowRight,
  PlusCircle,
  Check,
  X,
  Play,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  title: string;
  description: string;
  config?: Record<string, any>;
}

interface WorkflowProps {
  workflow?: {
    id: string;
    name: string;
    steps: WorkflowStep[];
    active: boolean;
  };
}

const WorkflowPanel: React.FC<WorkflowProps> = ({ workflow: initialWorkflow }) => {
  const [workflow, setWorkflow] = useState(initialWorkflow || {
    id: 'new-workflow',
    name: 'New Workflow',
    steps: [
      {
        id: 'trigger-1',
        type: 'trigger',
        title: 'When page loads',
        description: 'Triggered when the user opens the page'
      }
    ],
    active: false
  });

  const [editingName, setEditingName] = useState(false);
  const [workflowName, setWorkflowName] = useState(workflow.name);

  const handleAddStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: `${type}-${Date.now()}`,
      type,
      title: type === 'trigger' 
        ? 'New Trigger' 
        : type === 'condition' 
          ? 'New Condition'
          : 'New Action',
      description: 'Configure this step'
    };
    
    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const handleSaveWorkflowName = () => {
    setWorkflow(prev => ({
      ...prev,
      name: workflowName
    }));
    setEditingName(false);
    toast({
      title: "Workflow name updated",
      description: `Workflow name changed to "${workflowName}"`,
    });
  };

  const handleToggleActive = () => {
    setWorkflow(prev => ({
      ...prev,
      active: !prev.active
    }));
    
    toast({
      title: workflow.active ? "Workflow deactivated" : "Workflow activated",
      description: workflow.active 
        ? "The workflow has been turned off"
        : "The workflow is now running",
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="border-b dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WorkflowIcon className="w-4 h-4" />
          {editingName ? (
            <div className="flex items-center gap-1">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="h-7 w-[180px]"
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveWorkflowName}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingName(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h3 
              className="font-medium cursor-pointer hover:underline" 
              onClick={() => setEditingName(true)}
            >
              {workflow.name}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={workflow.active ? "default" : "outline"}
            size="sm"
            onClick={handleToggleActive}
            className="h-8"
          >
            <Play className="w-4 h-4 mr-1" />
            {workflow.active ? "Active" : "Inactive"}
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {workflow.steps.map((step, index) => (
            <div key={step.id} className="relative">
              {index > 0 && (
                <div className="absolute left-6 -top-6 h-6 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
              
              <Card className="relative border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${step.type === 'trigger' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : ''}
                    ${step.type === 'condition' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' : ''}
                    ${step.type === 'action' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : ''}
                  `}>
                    {step.type === 'trigger' && <Circle className="w-5 h-5" />}
                    {step.type === 'condition' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 16L12 12L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 16L20 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : null}
                    {step.type === 'action' && <Check className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">{step.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                    
                    <Button variant="ghost" size="sm" className="mt-3 h-7 text-xs">
                      Configure
                    </Button>
                  </div>
                </div>
              </Card>
              
              {index < workflow.steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="text-gray-300 dark:text-gray-700" />
                </div>
              )}
            </div>
          ))}
          
          <div className="pt-4">
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleAddStep('condition')}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Condition
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleAddStep('action')}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Action
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;
