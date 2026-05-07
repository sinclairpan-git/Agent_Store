# Cross-Project Contract Fixtures

These fixtures freeze the shared field names for Agent Store, AgentOps, and Ai_AutoSDLC contract tests.

- `signed_installation_assertion.v1.json` is produced by Agent Store.
- `agentops_credential_handoff.v1.json` is assembled from Agent Store assertion data plus Ai_AutoSDLC device proof data.
- `device_proof.v1.json` is stored here only for cross-project contract tests. Ai_AutoSDLC is the producer; Agent Store must not generate, sign, or fill missing device proof fields.
- `credential_issue_response.v1.json` is stored here for Agent Store CCT-003 consumer assertions only. Agent Store may display the AgentOps echo fields, but must not infer `active`, sign credentials, or produce ReporterCredential/IngestionToken/DeviceKey. AgentOps remains the response producer and owns full generation/validation.
- `credential_bootstrap_signature_verified.v1.json` is stored here for the AgentOps 017 echo after a signed test event. Agent Store consumes `signature_verified` as AgentOps-owned status and must not mark it verified from local predecessor states.
- `unsupported_schema.v2.json` is a negative fixture for unknown major versions.
