
// src/components/pro/clinical-calculator-suite.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Calculator, Lightbulb, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';


const calculatorTypes = [
  { id: 'qsofa', name: 'qSOFA Score (Sepsis)' },
  { id: 'wells-pe', name: "Wells' Score (Pulmonary Embolism)" },
  { id: 'chadsvasc', name: 'CHA₂DS₂-VASc Score (Stroke Risk in AF)' },
  { id: 'meld', name: 'MELD Score (Liver Disease Severity)' },
  { id: 'grace', name: 'GRACE Score (ACS Risk) - Placeholder' },
  { id: 'wells-dvt', name: "Wells' Score (DVT) - Placeholder" },
];

interface CalculationResult {
  score: number | string;
  interpretation: string;
  colorClass: string;
}

export function ClinicalCalculatorSuite() {
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [calculatorResult, setCalculatorResult] = useState<CalculationResult | null>(null);

  const handleCalculatorSelect = (calcId: string) => {
    setSelectedCalculator(calcId);
    setInputs({}); // Reset inputs for new calculator
    setCalculatorResult(null);
  };

  const handleInputChange = (fieldId: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [fieldId]: value }));
  };
  
  const handleCheckboxChange = (fieldId: string, checked: boolean) => {
    setInputs(prev => ({...prev, [fieldId]: checked}));
  }

  const handleCalculate = () => {
    if (!selectedCalculator) return;
    
    let result: CalculationResult | null = null;
    let score = 0;
    let interpretation = '';
    let colorClass = 'text-green-600 border-green-500 bg-green-500/10';

    switch (selectedCalculator) {
        case 'qsofa':
            if (inputs.respRate) score++;
            if (inputs.alteredMental) score++;
            if (inputs.sbpLow) score++;
            interpretation = `qSOFA Score: ${score}. `;
            if (score >= 2) {
                interpretation += 'High risk for poor outcome with sepsis. Consider escalating care and further sepsis workup.';
                colorClass = 'text-red-600 border-red-500 bg-red-500/10';
            } else {
                interpretation += 'Low risk based on qSOFA criteria. Continue monitoring.';
            }
            result = { score, interpretation, colorClass };
            break;
            
        case 'wells-pe':
            if (inputs.dvtSigns) score += 3;
            if (inputs.peLikely) score += 3;
            if (inputs.hrHigh) score += 1.5;
            if (inputs.immobilization) score += 1.5;
            if (inputs.prevDvtPe) score += 1.5;
            if (inputs.hemoptysis) score += 1;
            if (inputs.malignancy) score += 1;
            interpretation = `Wells' Score for PE: ${score}. `;
            if (score > 6) {
                interpretation += 'High Probability of PE.';
                colorClass = 'text-red-600 border-red-500 bg-red-500/10';
            } else if (score >= 2) {
                interpretation += 'Moderate Probability of PE.';
                 colorClass = 'text-orange-600 border-orange-500 bg-orange-500/10';
            } else {
                interpretation += 'Low Probability of PE.';
            }
             result = { score, interpretation, colorClass };
            break;

        case 'chadsvasc':
            if (inputs.chf) score++;
            if (inputs.htn) score++;
            if (inputs.age75) score += 2;
            if (inputs.diabetes) score++;
            if (inputs.stroke) score += 2;
            if (inputs.vascular) score++;
            if (inputs.age65) score++;
            if (inputs.female) score++;
            interpretation = `CHA₂DS₂-VASc Score: ${score}. This corresponds to an adjusted stroke risk. Consult guidelines for anticoagulation therapy recommendations based on this score.`;
            if(score >= 2) colorClass = 'text-red-600 border-red-500 bg-red-500/10';
            else if (score === 1) colorClass = 'text-orange-600 border-orange-500 bg-orange-500/10';
            result = { score, interpretation, colorClass };
            break;

        case 'meld':
            const creatinine = parseFloat(inputs.creatinine) || 0;
            const bilirubin = parseFloat(inputs.bilirubin) || 0;
            const inr = parseFloat(inputs.inr) || 0;
            if(creatinine > 0 && bilirubin > 0 && inr > 0) {
                 const clampedCreatinine = Math.max(1.0, Math.min(4.0, creatinine));
                 score = Math.round(
                    (0.957 * Math.log(clampedCreatinine)) +
                    (0.378 * Math.log(bilirubin)) +
                    (1.120 * Math.log(inr)) + 0.643
                 ) * 10;
                 if(score > 40) score = 40;
                 interpretation = `MELD Score: ${score}. Used to prioritize patients for liver transplants. Higher scores indicate more severe liver disease and higher short-term mortality.`;
                 if(score >= 25) colorClass = 'text-red-600 border-red-500 bg-red-500/10';
                 else if(score >= 15) colorClass = 'text-orange-600 border-orange-500 bg-orange-500/10';
            } else {
                 score = 'Invalid Input';
                 interpretation = 'Please enter valid positive values for Creatinine, Bilirubin, and INR to calculate the MELD score.';
                 colorClass = 'text-red-600 border-red-500 bg-red-500/10';
            }
            result = { score, interpretation, colorClass };
            break;
            
        default:
            const calculator = calculatorTypes.find(c => c.id === selectedCalculator);
            result = { score: 'N/A', interpretation: `Calculation for ${calculator?.name} is not yet implemented. This is a demonstration.`, colorClass: 'text-muted-foreground border-border bg-muted/50' };
            break;
    }

    setCalculatorResult(result);
  };

  const renderCalculatorInputs = () => {
    if (!selectedCalculator) {
      return <p className="text-muted-foreground text-sm text-center py-4">Select a calculator to see input fields.</p>;
    }
    
    const commonCheckbox = (id: string, label: string) => (
      <div key={id} className="flex items-center space-x-2">
        <Checkbox id={id} checked={!!inputs[id]} onCheckedChange={(checked) => handleCheckboxChange(id, !!checked)} />
        <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
      </div>
    );
    
    switch (selectedCalculator) {
      case 'qsofa':
         return (
          <div className="space-y-3 p-2 border rounded-md bg-muted/20">
            {commonCheckbox('respRate', 'Respiratory Rate ≥ 22/min')}
            {commonCheckbox('alteredMental', 'Altered Mental Status (GCS < 15)')}
            {commonCheckbox('sbpLow', 'Systolic BP ≤ 100 mmHg')}
          </div>
        );
      case 'wells-pe':
        return (
          <div className="space-y-3 p-2 border rounded-md bg-muted/20">
            {commonCheckbox('dvtSigns', 'Clinical signs and symptoms of DVT (3 pts)')}
            {commonCheckbox('peLikely', 'PE is #1 diagnosis OR equally likely (3 pts)')}
            {commonCheckbox('hrHigh', 'Heart rate > 100 bpm (1.5 pts)')}
            {commonCheckbox('immobilization', 'Immobilization at least 3 days OR surgery in the previous 4 weeks (1.5 pts)')}
            {commonCheckbox('prevDvtPe', 'Previous, objectively diagnosed DVT or PE (1.5 pts)')}
            {commonCheckbox('hemoptysis', 'Hemoptysis (1 pt)')}
            {commonCheckbox('malignancy', 'Malignancy w/ treatment within 6 mo or palliative (1 pt)')}
          </div>
        )
       case 'chadsvasc':
        return (
          <div className="space-y-3 p-2 border rounded-md bg-muted/20">
            {commonCheckbox('chf', 'Congestive heart failure (1 pt)')}
            {commonCheckbox('htn', 'Hypertension (1 pt)')}
            {commonCheckbox('age75', 'Age ≥ 75 years (2 pts)')}
            {commonCheckbox('diabetes', 'Diabetes mellitus (1 pt)')}
            {commonCheckbox('stroke', 'Stroke/TIA/thromboembolism (2 pts)')}
            {commonCheckbox('vascular', 'Vascular disease (prior MI, PAD, or aortic plaque) (1 pt)')}
            {commonCheckbox('age65', 'Age 65-74 years (1 pt)')}
            {commonCheckbox('female', 'Sex category Female (1 pt)')}
          </div>
        )
       case 'meld':
        return (
          <div className="space-y-3 p-2 border rounded-md bg-muted/20">
            <div><Label htmlFor="creatinine">Serum Creatinine (mg/dL)</Label><Input type="number" id="creatinine" step="0.1" value={inputs.creatinine || ''} onChange={e=>handleInputChange('creatinine', e.target.value)} className="mt-1 rounded-sm"/></div>
            <div><Label htmlFor="bilirubin">Serum Bilirubin (mg/dL)</Label><Input type="number" id="bilirubin" step="0.1" value={inputs.bilirubin || ''} onChange={e=>handleInputChange('bilirubin', e.target.value)} className="mt-1 rounded-sm"/></div>
            <div><Label htmlFor="inr">INR</Label><Input type="number" id="inr" step="0.1" value={inputs.inr || ''} onChange={e=>handleInputChange('inr', e.target.value)} className="mt-1 rounded-sm"/></div>
          </div>
        )
      default:
        return <p className="text-muted-foreground text-sm text-center py-4">Input fields for {calculatorTypes.find(c => c.id === selectedCalculator)?.name} will appear here.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="border-orange-500/50 bg-orange-500/10">
        <Lightbulb className="h-5 w-5 text-orange-600" />
        <AlertTitle className="font-semibold text-orange-700 dark:text-orange-500">Clinical Calculator</AlertTitle>
        <AlertDescription className="text-orange-600/90 dark:text-orange-500/90 text-xs">
          This calculator suite is for educational and quick reference purposes. Always verify with official guidelines.
        </AlertDescription>
      </Alert>

      <Card className="shadow-md rounded-xl border-yellow-500/30 bg-gradient-to-br from-card via-card to-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-yellow-600" />
            Intelligent Clinical Calculator Suite
          </CardTitle>
          <CardDescription>Select a calculator, input parameters, and view results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="calculator-select">Select Calculator</Label>
            <Select onValueChange={handleCalculatorSelect}>
              <SelectTrigger id="calculator-select" className="w-full mt-1 rounded-lg">
                <SelectValue placeholder="Choose a clinical calculator..." />
              </SelectTrigger>
              <SelectContent>
                {calculatorTypes.map(calc => (
                  <SelectItem key={calc.id} value={calc.id}>{calc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderCalculatorInputs()}

          {selectedCalculator && (
            <Button onClick={handleCalculate} className="w-full sm:w-auto rounded-lg py-2.5 text-sm group mt-3">
              <Calculator className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Calculate Score
            </Button>
          )}

          {calculatorResult && (
            <div className={cn("mt-4 p-4 border rounded-md", calculatorResult.colorClass)}>
              <h4 className="font-semibold text-md mb-1">Result:</h4>
              <p className="text-lg font-bold">{calculatorResult.score}</p>
              <p className="text-sm whitespace-pre-wrap">{calculatorResult.interpretation}</p>
              
              <Alert variant="default" className="mt-3 border-red-500/50 bg-red-500/10 text-xs">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-700 dark:text-red-500 text-xs font-medium">Disclaimer</AlertTitle>
                <AlertDescription className="text-red-600/90 dark:text-red-500/90">
                  This calculator is for informational/educational use only. It does not replace clinical judgment. Always verify with official sources and guidelines.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
