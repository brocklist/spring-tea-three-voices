import type { MatchResult, StudentProject, TeaGardenResource } from '../types/domain';

export function buildMatchResults(projects: StudentProject[], gardens: TeaGardenResource[]): MatchResult[] {
  return projects
    .flatMap((project) =>
      gardens.map((garden) => {
        const matchedTags = project.tags.filter((tag) => garden.tags.includes(tag));
        const score = Math.min(98, Math.round((matchedTags.length / Math.max(project.tags.length, 1)) * 78 + matchedTags.length * 8));

        return {
          id: `${project.id}-${garden.id}`,
          project,
          garden,
          matchedTags,
          score,
          reason:
            matchedTags.length > 0
              ? `双方在 ${matchedTags.join('、')} 方向上高度重合，适合进入方案沟通。`
              : '当前标签重合较少，可作为后续资源池观察对象。',
        };
      }),
    )
    .filter((result) => result.matchedTags.length > 0)
    .sort((a, b) => b.score - a.score);
}
