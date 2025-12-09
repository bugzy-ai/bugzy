import type { TaskStep } from '../types';

export const notifyTeamStep: TaskStep = {
  id: 'notify-team',
  title: 'Team Communication',
  category: 'communication',
  content: `## Team Communication

{{INVOKE_TEAM_COMMUNICATOR}}

Notify the team about progress and results:

**Post Update Including:**
1. Post execution summary with key statistics
2. Highlight critical failures that need immediate attention
3. Share important learnings about product behavior
4. Report any potential bugs discovered during testing
5. Ask for clarification on unexpected behaviors
6. Provide recommendations for areas needing investigation
7. Use appropriate urgency level based on failure severity

**Communication Content:**
- **Execution summary**: Overall pass/fail statistics and timing
- **Critical issues**: High-priority failures that need immediate attention
- **Key learnings**: Important discoveries about product behavior
- **Potential bugs**: Issues that may require bug reports
- **Clarifications needed**: Unexpected behaviors requiring team input
- **Recommendations**: Suggested follow-up actions

**Communication Strategy Based on Results:**
- **All tests passed**: Brief positive update, highlight learnings
- **Minor failures**: Standard update with failure details and plans
- **Critical failures**: Urgent notification with detailed analysis
- **New discoveries**: Separate message highlighting interesting findings

**Update team communicator memory:**
- Record communication
- Track team response patterns
- Document any clarifications provided
- Note team priorities based on their responses`,
  requiresSubagent: 'team-communicator',
  invokesSubagents: ['team-communicator'],
  tags: ['communication', 'optional'],
};
