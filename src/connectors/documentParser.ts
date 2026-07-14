import type { VaultDocument, DocumentCategory } from "@/types/document";
import { DATA_SOURCE } from "@/config/dataSource";
import {
  NotImplementedError,
  type Connector,
  type ConnectorHealth,
  type ConnectorMode,
} from "./base";

export interface ParsedDocument {
  documentId: string;
  category: DocumentCategory;
  confidence: number;
  extracted: Record<string, string>;
}

export interface DocumentParserConnector extends Connector {
  parse(tenantId: string, document: VaultDocument): Promise<ParsedDocument>;
}

class MockDocumentParserConnector implements DocumentParserConnector {
  readonly name = "documentParser";
  readonly mode: ConnectorMode = "mock";

  async parse(
    _tenantId: string,
    document: VaultDocument,
  ): Promise<ParsedDocument> {
    return {
      documentId: document.id,
      category: document.category,
      confidence: 0.92,
      extracted: {
        title: document.name,
        owner: document.owner,
        uploadedAt: document.uploadedAt,
      },
    };
  }

  async getHealth(tenantId: string): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: true,
      lastCheckedAt: null,
      message: `Serving mock document parsing for ${tenantId}`,
    };
  }
}

class LiveDocumentParserConnector implements DocumentParserConnector {
  readonly name = "documentParser";
  readonly mode: ConnectorMode = "live";

  async parse(): Promise<ParsedDocument> {
    throw new NotImplementedError(this.name, "parse");
  }

  async getHealth(): Promise<ConnectorHealth> {
    return {
      connector: this.name,
      mode: this.mode,
      connected: false,
      lastCheckedAt: null,
      message: "Live document parser connector is not configured",
    };
  }
}

export function getDocumentParserConnector(
  mode: ConnectorMode = DATA_SOURCE,
): DocumentParserConnector {
  return mode === "live"
    ? new LiveDocumentParserConnector()
    : new MockDocumentParserConnector();
}
