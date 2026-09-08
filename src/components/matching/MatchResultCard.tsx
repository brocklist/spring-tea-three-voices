import { ArrowRight, MapPin } from "lucide-react";
import type { MatchResult } from "../../types/domain";
export function MatchResultCard({ result }: { result: MatchResult }) {
  return (
    <article className="match-card">
      <header>
        <span className="match-score">
          {result.score}
          <small>匹配分</small>
        </span>
        <span>
          <MapPin size={15} />
          {result.garden.location}
        </span>
      </header>
      <div className="match-pair">
        <div>
          <small>青年项目</small>
          <h2>{result.project.projectName}</h2>
        </div>
        <ArrowRight aria-hidden="true" />
        <div>
          <small>合作茶园</small>
          <h2>{result.garden.gardenName}</h2>
        </div>
      </div>
      <div className="resource-tags">
        {result.matchedTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <p>{result.reason}</p>
      <p className="match-terms">
        <strong>合作条件</strong>{" "}
        {result.garden.cooperationTerms || "双方进一步沟通"}
      </p>
      <details>
        <summary>展开合作详情</summary>
        <dl>
          <dt>团队介绍</dt>
          <dd>{result.project.teamIntro || "待补充"}</dd>
          <dt>项目需求</dt>
          <dd>{result.project.requiredResources || "待沟通"}</dd>
          <dt>茶园资源</dt>
          <dd>{result.garden.resources || "待沟通"}</dd>
          <dt>合作方式</dt>
          <dd>{result.project.cooperationMode || "待沟通"}</dd>
          <dt>团队联系</dt>
          <dd>{result.project.contact || "暂未填写"}</dd>
          <dt>茶园联系</dt>
          <dd>{result.garden.contact || "暂未填写"}</dd>
        </dl>
      </details>
    </article>
  );
}
