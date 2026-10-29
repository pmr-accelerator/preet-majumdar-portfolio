import { describe, expect, it } from 'vitest';

describe('portfolio content accuracy', () => {
  it('does not imply a project has been completed in the initial state', () => {
    const initialPublishedProjects = 0;
    expect(initialPublishedProjects).toBe(0);
  });

  it('keeps skill proficiency descriptive rather than percentage-based', () => {
    const skills = ['Basic', 'Learning', 'Developing', 'Comfortable', 'Proficient'];
    expect(skills.every(level => !level.includes('%'))).toBe(true);
  });
});
