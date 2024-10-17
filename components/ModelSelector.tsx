import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelSelectorProps {
  onSelectModel: (model: string) => void;
}

export const models = {
  textGeneration: [
    'gemma2-9b-it',
    'gemma-7b-it',
    'llama3-groq-70b-8192-tool-use-preview',
    'llama3-groq-8b-8192-tool-use-preview',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'llama-3.2-1b-preview',
    'llama-3.2-3b-preview',
    'llama-3.2-11b-vision-preview',
    'llava-v1.5-7b-4096-preview',
    'mixtral-8x7b-32768',
  ],
  codeGeneration:[
    'Meta-Llama-3.1-8B-Instruct',
    'Meta-Llama-3.1-70B-Instruct',
    'Llama-3.1-70B-Dracarys',
    'Llama-3.1-8B-Enigma',
    'Llama-3.1-70B-Hermes-3',
    'Llama-3.1-8B-ArliAI-RPMax-v1.1',
    'Mistral-Nemo-12B-Instruct-2407',
  ],
  imageGeneration: [
    'XLabs-AI/flux-RealismLora',
  ]
};

export function ModelSelector({ onSelectModel }: ModelSelectorProps) {
  return (
    <Select onValueChange={onSelectModel} defaultValue={models.textGeneration[0]}>
      <SelectTrigger className="w-[300px] bg-gray-800 border-gray-700 text-white">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Image Generation</SelectLabel>
          {models.imageGeneration.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Text Generation</SelectLabel>
          {models.textGeneration.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Code Generation</SelectLabel>
          {models.codeGeneration.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
