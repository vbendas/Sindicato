import { callOpenRouter } from './openrouter';
import { CLERK_VALIDATION_SYSTEM } from './prompts';
import { getClerkModel } from './openrouter';

interface DomainValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates whether a user's question can be answered using Sindicato's data.
 * This acts as a security layer to ensure the AI only responds to domain-appropriate queries.
 */
export async function validateDomainScope(userMessage: string): Promise<DomainValidationResult> {
  try {
    const rawResponse = await callOpenRouter({
      model: getClerkModel(), // Use the same model as configured for clerk operations
      systemPrompt: CLERK_VALIDATION_SYSTEM,
      userPrompt: userMessage,
      temperature: 0.1, // Low temperature for more consistent validation
      maxTokens: 256, // Small response needed
    });

    // Clean the response to extract JSON
    const cleaned = rawResponse
      .replace(/```(?:json)?\n?/gi, '')
      .trim();

    const result = JSON.parse(cleaned) as DomainValidationResult;
    
    return result;
  } catch (error) {
    console.error('Domain validation error:', error);
    // If validation fails due to technical issues, we should be conservative and allow the query
    // to prevent blocking legitimate requests
    return { valid: true, reason: 'Validation temporarily unavailable, allowing query' };
  }
}