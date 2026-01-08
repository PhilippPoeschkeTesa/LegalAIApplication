import { RedlineRun, RedlineRunCreationAttributes } from '../models/RedlineRun';
import { Finding, FindingCreationAttributes } from '../models/Finding';
import { UserDecision, UserDecisionCreationAttributes } from '../models/UserDecision';
import { DocumentVersion } from '../models/DocumentVersion';
import { azureOpenAIService } from './azureOpenAIService';

interface RedlineConfig {
  primaryModel: string;
  verifierModel: string;
  profileId: string;
}

export class RedlineService {
  async startRedlineRun(
    documentId: string,
    versionId: string,
    config: RedlineConfig
  ): Promise<RedlineRun> {
    const run = await RedlineRun.create({
      document_id: documentId,
      version_id: versionId,
      profile_id: config.profileId,
      status: 'queued',
      primary_model: config.primaryModel,
      verifier_model: config.verifierModel,
    });

    // Start async processing (non-blocking)
    this.processRedlineRun(run.id).catch((error) => {
      console.error(`Redline run ${run.id} failed:`, error);
    });

    return run;
  }

  private async processRedlineRun(runId: string): Promise<void> {
    try {
      // Update status to running
      await RedlineRun.update({ status: 'running', started_at: new Date() }, { where: { id: runId } });

      const run = await RedlineRun.findByPk(runId);
      if (!run) throw new Error('Run not found');

      // Get document version
      const version = await DocumentVersion.findByPk(run.version_id);
      if (!version) throw new Error('Version not found');

      // Download document from blob storage and extract text
      const documentText = await this.extractDocumentText(version.blob_url, version.file_type);

      // STAGE 1: Primary Analysis
      const primaryFindings = await this.runPrimaryAnalysis(documentText, run.primary_model || 'gpt-4');

      // STAGE 2: Verification
      const verifiedFindings = await this.runVerification(
        documentText,
        primaryFindings,
        run.verifier_model || 'gpt-4o'
      );

      // Save findings to database
      await this.saveFindings(runId, verifiedFindings);

      // Calculate overall risk score
      const riskScore = this.calculateOverallRiskScore(verifiedFindings);

      // Mark run as completed
      await RedlineRun.update(
        {
          status: 'completed',
          finished_at: new Date(),
          overall_risk_score: riskScore,
        },
        { where: { id: runId } }
      );
    } catch (error: any) {
      await RedlineRun.update(
        {
          status: 'failed',
          finished_at: new Date(),
          error_message: error.message,
        },
        { where: { id: runId } }
      );
      throw error;
    }
  }

  private async extractDocumentText(blobUrl: string, fileType: string): Promise<string> {
    // TODO: Implement document text extraction
    // For DOCX: use mammoth library
    // For PDF: use pdf-parse library
    // For now, return mock text for testing

    console.log(`Extracting text from ${fileType} at ${blobUrl}`);

    // Mock contract text for testing
    return `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement (the "Agreement") is entered into as of October 13, 2025
between tesa SE ("Disclosing Party") and Acme GmbH ("Receiving Party").

1. Purpose
The parties wish to explore a business opportunity of mutual interest and in connection
with this opportunity, Disclosing Party may disclose certain confidential information.

2. Confidential Information
Confidential Information means any information disclosed by Disclosing Party to Receiving
Party, including but not limited to technical data, trade secrets, know-how, research,
product plans, products, services, customers, customer lists, markets, software,
developments, inventions, processes, formulas, technology, designs, drawings,
engineering, hardware configuration information, marketing, finances or other business information.

3. Limitation of Liability
In no event shall either party be liable for damages exceeding €10,000 or the amount
paid under this Agreement, whichever is less.

4. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of
Delaware, United States, without regard to conflict of law principles.

5. Term
This Agreement shall remain in effect for a period of one (1) year from the date
of disclosure of the Confidential Information.
    `.trim();
  }

  private async runPrimaryAnalysis(documentText: string, model: string): Promise<any[]> {
    const systemPrompt = `You are a legal document analyzer specialized in contract review. Analyze the following contract and identify potential risks and issues.

For each finding, provide:
- severity: "High", "Medium", or "Low"
- category: specific issue type (e.g., "Liability Cap", "Governing Law", "Confidentiality Term")
- location: { page: number or null, start_offset: character position or null }
- evidence: exact text snippet from the document (max 200 chars)
- policy_reference: which internal policy or best practice this relates to (or "No specific policy")
- rationale: why this is an issue (1-2 sentences)
- proposed_rewrite: suggested alternative text (or null if none)
- score: risk score from 0-100

Focus on:
- HIGH RISK: Liability caps below industry standard, broad indemnification, IP ownership issues, unfavorable termination rights, jurisdiction in unfavorable courts
- MEDIUM RISK: Payment terms, notice periods, governing law concerns, warranty limitations
- LOW RISK: Formatting issues, clarity improvements, missing definitions

Return your response as a JSON object with a "findings" array.`;

    try {
      const findings = await azureOpenAIService.analyzeLegalDocument(documentText, systemPrompt, model);
      console.log(`Primary analysis found ${findings.length} findings`);
      return findings;
    } catch (error) {
      console.error('Primary analysis failed:', error);
      // Return empty array instead of failing the entire run
      return [];
    }
  }

  private async runVerification(documentText: string, primaryFindings: any[], verifierModel: string): Promise<any[]> {
    const verifiedFindings = [];

    for (const finding of primaryFindings) {
      const verificationPrompt = `Review this finding from primary contract analysis:

Severity: ${finding.severity}
Category: ${finding.category}
Evidence: ${finding.evidence}
Rationale: ${finding.rationale}

Original Document Context (excerpt):
${documentText.substring(0, 1000)}

Verify:
1. Is this a genuine risk that requires attention? (verified_risky or verified_safe)
2. Is the severity level (${finding.severity}) accurate, or should it be adjusted?
3. Is the evidence snippet actually present in the document?
4. Any additional notes or corrections?

Return your response as a JSON object with:
{
  "verification_status": "verified_risky" or "verified_safe",
  "notes": "Brief explanation of your verification decision"
}`;

      try {
        const verification = await azureOpenAIService.verifyFinding(verificationPrompt, verifierModel);

        verifiedFindings.push({
          ...finding,
          verification_status: verification.verification_status || 'unverified',
          verifier_notes: verification.notes || '',
        });
      } catch (error) {
        console.error(`Verification failed for finding ${finding.category}:`, error);
        // Keep finding but mark as unverified
        verifiedFindings.push({
          ...finding,
          verification_status: 'unverified',
          verifier_notes: 'Verification step failed',
        });
      }
    }

    console.log(`Verified ${verifiedFindings.length} findings`);
    return verifiedFindings;
  }

  private async saveFindings(runId: string, findings: any[]): Promise<string[]> {
    const findingIds: string[] = [];

    for (const f of findings) {
      try {
        const finding = await Finding.create({
          run_id: runId,
          severity: f.severity || 'Medium',
          score: f.score || 50,
          category: f.category || 'General',
          location_page: f.location?.page,
          location_start_offset: f.location?.start_offset,
          location_end_offset: f.location?.end_offset,
          evidence_snippet: f.evidence,
          evidence_policy_ref: f.policy_reference,
          evidence_rationale: f.rationale,
          suggestion_proposed_rewrite: f.proposed_rewrite,
          verification_status: f.verification_status || 'unverified',
          verifier_notes: f.verifier_notes,
        });

        findingIds.push(finding.id);
      } catch (error) {
        console.error('Failed to save finding:', error);
      }
    }

    return findingIds;
  }

  private calculateOverallRiskScore(findings: any[]): number {
    if (findings.length === 0) return 0;

    const weights = { High: 1.0, Medium: 0.5, Low: 0.2 };
    let totalWeightedScore = 0;
    let totalWeight = 0;

    findings.forEach((f) => {
      const weight = weights[f.severity as keyof typeof weights] || 0.2;
      const score = f.score || 50;
      totalWeightedScore += score * weight;
      totalWeight += weight;
    });

    return Math.round(totalWeightedScore / totalWeight);
  }

  async getRunById(runId: string): Promise<RedlineRun | null> {
    return await RedlineRun.findByPk(runId);
  }

  async getRunFindings(runId: string): Promise<Finding[]> {
    return await Finding.findAll({
      where: { run_id: runId },
      order: [
        ['severity', 'ASC'],
        ['score', 'DESC'],
      ],
    });
  }

  async recordUserDecision(data: UserDecisionCreationAttributes): Promise<UserDecision> {
    return await UserDecision.create(data);
  }
}

export const redlineService = new RedlineService();
