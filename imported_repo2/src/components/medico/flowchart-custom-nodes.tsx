// src/components/medico/flowchart-custom-nodes.tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { NodeResizer } from '@reactflow/node-resizer';
import { cn } from '@/lib/utils';
import { FlaskConical, Stethoscope, TestTube, Cross, ShieldQuestion, Beaker } from 'lucide-react';

const CustomNodeWrapper = memo(({ children, selected, type }: { children: React.ReactNode; selected: boolean; type: string }) => (
  <div className={cn(
    "p-3 shadow-md rounded-lg bg-card border-2 relative group",
    selected ? 'border-primary shadow-lg' : 'border-border/50',
    type === 'decision' && 'transform rotate-45 w-40 h-40 flex items-center justify-center',
    type !== 'decision' && 'w-48'
  )}>
    <NodeResizer minWidth={type === 'decision' ? 160 : 150} minHeight={type === 'decision' ? 160 : 60} isVisible={selected} lineClassName="border-primary" handleClassName="h-3 w-3 bg-white border-2 rounded-full border-primary" />
    <div className={cn(type === 'decision' && '-rotate-45 text-center')}>
      {children}
    </div>
  </div>
));
CustomNodeWrapper.displayName = 'CustomNodeWrapper';

export const SymptomNode = memo(({ data, selected }: NodeProps) => (
  <CustomNodeWrapper selected={selected} type="symptom">
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    <div className="flex items-center gap-2 mb-1">
      <Stethoscope className="h-4 w-4 text-blue-500"/>
      <div className="text-blue-500 font-bold text-xs uppercase">Symptom</div>
    </div>
    <div className="text-sm font-semibold text-foreground">{data.label}</div>
  </CustomNodeWrapper>
));
SymptomNode.displayName = 'SymptomNode';

export const TestNode = memo(({ data, selected }: NodeProps) => (
  <CustomNodeWrapper selected={selected} type="test">
    <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    <div className="flex items-center gap-2 mb-1">
      <Beaker className="h-4 w-4 text-purple-500"/>
      <div className="text-purple-500 font-bold text-xs uppercase">Test</div>
    </div>
    <div className="text-sm font-semibold text-foreground">{data.label}</div>
  </CustomNodeWrapper>
));
TestNode.displayName = 'TestNode';

export const TreatmentNode = memo(({ data, selected }: NodeProps) => (
  <CustomNodeWrapper selected={selected} type="treatment">
    <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
    <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    <div className="flex items-center gap-2 mb-1">
      <FlaskConical className="h-4 w-4 text-green-500"/>
      <div className="text-green-500 font-bold text-xs uppercase">Treatment</div>
    </div>
    <div className="text-sm font-semibold text-foreground">{data.label}</div>
  </CustomNodeWrapper>
));
TreatmentNode.displayName = 'TreatmentNode';

export const DecisionNode = memo(({ data, selected }: NodeProps) => (
  <CustomNodeWrapper selected={selected} type="decision">
    <Handle type="target" position={Position.Top} id="in" className="!top-[-5px] w-2 h-2 !bg-primary" />
    <Handle type="source" position={Position.Right} id="yes" className="!right-[-5px] w-2 h-2 !bg-primary" />
    <Handle type="source" position={Position.Bottom} id="no" className="!bottom-[-5px] w-2 h-2 !bg-primary" />
    <Handle type="source" position={Position.Left} id="alt" className="!left-[-5px] w-2 h-2 !bg-primary" />
    <div className="flex items-center gap-2 mb-1 justify-center">
      <ShieldQuestion className="h-4 w-4 text-orange-500"/>
      <div className="text-orange-500 font-bold text-xs uppercase">Decision</div>
    </div>
    <div className="text-sm font-semibold text-foreground">{data.label}</div>
  </CustomNodeWrapper>
));
DecisionNode.displayName = 'DecisionNode';

export const nodeTypes = {
  symptom: SymptomNode,
  test: TestNode,
  treatment: TreatmentNode,
  decision: DecisionNode,
};
