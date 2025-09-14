# Design Document

## Overview

This design document outlines the improvements to the KPR (Kredit Pemilikan Rumah) simulator to enhance user experience, visual clarity, and ease of use. The current implementation provides basic functionality but lacks modern UX patterns, visual feedback, and intuitive information architecture that would make it truly user-friendly for Indonesian home buyers.

The improved design will transform the simulator from a basic calculation tool into an engaging, educational, and confidence-building experience that guides users through mortgage decision-making.

## Architecture

### Component Structure

```
KPRSimulator/
├── KPRSimulatorContainer (Main component)
├── InputSection/
│   ├── DownPaymentSlider
│   ├── TenorSelector
│   └── BankSelector
├── ResultsSection/
│   ├── PaymentSummaryCard
│   ├── AffordabilityIndicator
│   └── PaymentBreakdownChart
├── EducationalSection/
│   ├── KPRTipsPanel
│   └── RequirementsChecklist
└── ActionSection/
    ├── ScenarioComparison
    └── NextStepsPanel
```

### State Management

The component will use React's useState for local state management with the following state structure:

```typescript
interface KPRSimulatorState {
  // Input parameters
  downPayment: number;
  tenor: number;
  selectedBank: Bank;
  
  // UI state
  activeTab: 'calculator' | 'comparison' | 'education';
  showAdvancedOptions: boolean;
  savedScenarios: Scenario[];
  
  // Calculation results
  calculationResults: CalculationResults;
  affordabilityStatus: 'good' | 'moderate' | 'risky';
}
```

## Components and Interfaces

### 1. Enhanced Input Controls

#### DownPaymentSlider Component
- **Visual Design**: Custom styled range slider with gradient track showing affordability zones
- **Features**: 
  - Real-time value display with large, prominent Rupiah amount
  - Visual indicators for recommended DP ranges (green: 20%+, yellow: 15-20%, red: <15%)
  - Tooltip showing impact on monthly payment
- **Interaction**: Smooth animations, haptic feedback on mobile

#### TenorSelector Component
- **Visual Design**: Card-based selection instead of dropdown
- **Features**:
  - Visual comparison of monthly payment vs total interest for each option
  - Recommended tenor highlighting based on user's financial profile
  - Quick comparison tooltips

#### BankSelector Component
- **Visual Design**: Enhanced card layout with bank logos and detailed information
- **Features**:
  - Interest rate comparison with visual indicators
  - Bank-specific features and benefits
  - "Best for you" recommendations based on calculation results

### 2. Results Display Enhancement

#### PaymentSummaryCard Component
- **Visual Design**: Large, prominent display with clear hierarchy
- **Features**:
  - Animated number transitions when inputs change
  - Color-coded affordability indicators
  - Quick comparison with rent prices in the area
  - Progress bar showing payment vs income ratio

#### AffordabilityIndicator Component
- **Visual Design**: Traffic light system with detailed explanations
- **Features**:
  - Green: Comfortable (payment <30% of income)
  - Yellow: Moderate (payment 30-40% of income)
  - Red: Risky (payment >40% of income)
  - Personalized recommendations for each status

#### PaymentBreakdownChart Component
- **Visual Design**: Interactive donut chart or stacked bar chart
- **Features**:
  - Principal vs interest breakdown over time
  - Interactive timeline showing payment evolution
  - Comparison with total rent over same period

### 3. Educational and Guidance Features

#### KPRTipsPanel Component
- **Content**: Contextual tips based on user's current selections
- **Features**:
  - Dynamic tips that change based on input values
  - Educational content about KPR process
  - Common mistakes and how to avoid them

#### RequirementsChecklist Component
- **Visual Design**: Interactive checklist with progress indicators
- **Features**:
  - Document requirements with upload capabilities
  - Eligibility checker based on user inputs
  - Bank-specific requirement variations

### 4. Advanced Features

#### ScenarioComparison Component
- **Features**:
  - Side-by-side comparison of different scenarios
  - Save and load scenarios for later comparison
  - Share scenarios with family or financial advisors

#### NextStepsPanel Component
- **Features**:
  - Clear action items based on calculation results
  - Direct links to bank applications
  - Contact information for mortgage brokers

## Data Models

### Bank Interface
```typescript
interface Bank {
  id: string;
  name: string;
  logo: string;
  interestRate: number;
  minDownPayment: number;
  maxTenor: number;
  features: string[];
  processingTime: string;
  adminFee: number;
  specialOffers?: SpecialOffer[];
}
```

### Calculation Results Interface
```typescript
interface CalculationResults {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  loanAmount: number;
  downPaymentAmount: number;
  minSalaryRequired: number;
  paymentToIncomeRatio: number;
  affordabilityStatus: 'good' | 'moderate' | 'risky';
  paymentSchedule: PaymentScheduleItem[];
}
```

### Scenario Interface
```typescript
interface Scenario {
  id: string;
  name: string;
  housePrice: number;
  downPayment: number;
  tenor: number;
  bank: Bank;
  results: CalculationResults;
  createdAt: Date;
}
```

## Error Handling

### Input Validation
- Real-time validation with clear error messages
- Prevent invalid combinations (e.g., DP higher than house price)
- Graceful handling of edge cases in calculations

### Calculation Errors
- Fallback values for extreme scenarios
- Clear messaging when calculations are not possible
- Alternative suggestions when inputs are invalid

### Network and Performance
- Optimistic updates for immediate feedback
- Debounced calculations to prevent excessive re-renders
- Loading states for any async operations

## Testing Strategy

### Unit Testing
- Test calculation accuracy with various input combinations
- Validate input constraints and edge cases
- Test component rendering with different props

### Integration Testing
- Test user workflows from input to results
- Validate state management across component interactions
- Test responsive behavior across device sizes

### User Experience Testing
- A/B testing for different layout approaches
- Usability testing with actual home buyers
- Performance testing on various devices and network conditions

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation support
- Color contrast validation
- Touch target size validation for mobile

## Performance Considerations

### Optimization Strategies
- Memoization of expensive calculations
- Lazy loading of educational content
- Optimized re-renders using React.memo and useMemo
- Efficient state updates to prevent unnecessary calculations

### Mobile Performance
- Touch-optimized interactions
- Reduced motion for users with motion sensitivity
- Optimized bundle size for faster loading
- Progressive enhancement for advanced features

## Visual Design System

### Color Palette
- Primary: Amber (#F59E0B) - for CTAs and highlights
- Success: Green (#10B981) - for positive indicators
- Warning: Yellow (#F59E0B) - for moderate risk
- Danger: Red (#EF4444) - for high risk indicators
- Neutral: Gray scale for text and backgrounds

### Typography
- Headers: Bold, clear hierarchy
- Body text: Readable font sizes (16px+ on mobile)
- Numbers: Monospace font for consistency
- Currency: Prominent display with proper formatting

### Spacing and Layout
- Consistent 8px grid system
- Generous white space for clarity
- Card-based layout for logical grouping
- Responsive breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)

### Animation and Transitions
- Smooth transitions for value changes (300ms ease-out)
- Micro-interactions for user feedback
- Loading animations for calculations
- Entrance animations for results display

## Accessibility Compliance

### WCAG 2.1 AA Standards
- Color contrast ratios of 4.5:1 minimum
- Keyboard navigation support
- Screen reader compatibility with proper ARIA labels
- Focus indicators for all interactive elements

### Inclusive Design
- Support for users with limited financial literacy
- Clear language avoiding jargon
- Visual indicators supplementing text information
- Multiple ways to access the same information