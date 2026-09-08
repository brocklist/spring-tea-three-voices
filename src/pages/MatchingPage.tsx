import { WorkspaceDrawer } from "../components/ui/WorkspaceDrawer";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { ArrowRight, Building2, FileUp, Sprout, Users } from "lucide-react";
import { MatchResultCard } from "../components/matching/MatchResultCard";
import { TagPicker } from "../components/matching/TagPicker";
import {
  defaultGardenResources,
  defaultStudentProjects,
  matchTags,
} from "../data/mockData";
import { buildMatchResults } from "../lib/matching";
import { readStorage, writeStorage } from "../lib/storage";
import type { StudentProject, TeaGardenResource } from "../types/domain";

const PROJECTS_KEY = "spring-tea-student-projects";
const GARDENS_KEY = "spring-tea-garden-resources";

interface ProjectFormState {
  projectName: string;
  teamIntro: string;
  direction: string;
  requiredResources: string;
  cooperationMode: string;
  contact: string;
  tags: string[];
  attachmentName?: string;
}

interface GardenFormState {
  gardenName: string;
  location: string;
  resources: string;
  supportedDirections: string;
  cooperationTerms: string;
  contact: string;
  tags: string[];
  mediaName?: string;
}

type DialogType = "project" | "garden" | null;

const emptyProjectForm: ProjectFormState = {
  projectName: "",
  teamIntro: "",
  direction: "",
  requiredResources: "",
  cooperationMode: "",
  contact: "",
  tags: [],
};

const emptyGardenForm: GardenFormState = {
  gardenName: "",
  location: "",
  resources: "",
  supportedDirections: "",
  cooperationTerms: "",
  contact: "",
  tags: [],
};

export function MatchingPage() {
  const [projects, setProjects] = useState<StudentProject[]>(() =>
    readStorage(PROJECTS_KEY, defaultStudentProjects),
  );
  const [gardens, setGardens] = useState<TeaGardenResource[]>(() =>
    readStorage(GARDENS_KEY, defaultGardenResources),
  );
  const [projectForm, setProjectForm] =
    useState<ProjectFormState>(emptyProjectForm);
  const [gardenForm, setGardenForm] =
    useState<GardenFormState>(emptyGardenForm);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [tab, setTab] = useState<"matches" | "projects" | "gardens">("matches");
  const [filter, setFilter] = useState("全部");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const openForm = (type: DialogType) => {
    setFormError("");
    setActiveDialog(type);
  };

  const matchResults = useMemo(
    () => buildMatchResults(projects, gardens),
    [projects, gardens],
  );

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectForm.projectName.trim() || projectForm.tags.length === 0) {
      setFormError("请填写项目名称，并至少选择一个匹配标签。");
      return;
    }

    const nextProject: StudentProject = {
      id: `student-${Date.now()}`,
      ...projectForm,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const nextProjects = [nextProject, ...projects];
    const saved = writeStorage(PROJECTS_KEY, nextProjects);
    setProjects(nextProjects);
    setProjectForm(emptyProjectForm);
    setTab("projects");
    setFilter("全部");
    setNotice(
      saved
        ? "创业计划已保存到本机，匹配结果已更新。"
        : "本机存储不可用，计划仅在本次页面会话中保留；刷新将丢失，请复制备份资料。",
    );
    setActiveDialog(null);
  }

  function submitGarden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gardenForm.gardenName.trim() || gardenForm.tags.length === 0) {
      setFormError("请填写茶园名称，并至少选择一个资源标签。");
      return;
    }

    const nextGarden: TeaGardenResource = {
      id: `garden-${Date.now()}`,
      ...gardenForm,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const nextGardens = [nextGarden, ...gardens];
    const saved = writeStorage(GARDENS_KEY, nextGardens);
    setGardens(nextGardens);
    setGardenForm(emptyGardenForm);
    setTab("gardens");
    setFilter("全部");
    setNotice(
      saved
        ? "茶园资源已保存到本机，匹配结果已更新。"
        : "本机存储不可用，资源仅在本次页面会话中保留；刷新将丢失，请复制备份资料。",
    );
    setActiveDialog(null);
  }

  const shownMatches = matchResults.filter(
    (item) => filter === "全部" || item.matchedTags.includes(filter),
  );
  const shownProjects = projects.filter(
    (item) => filter === "全部" || item.tags.includes(filter),
  );
  const shownGardens = gardens.filter(
    (item) => filter === "全部" || item.tags.includes(filter),
  );
  const tabs = [
    { id: "matches", label: "推荐匹配", count: matchResults.length },
    { id: "projects", label: "创业计划", count: projects.length },
    { id: "gardens", label: "茶园资源", count: gardens.length },
  ] as const;
  return (
    <div className="matching-workspace">
      <header className="matching-masthead">
        <div>
          <p className="work-eyebrow">THE NEXT GROWTH / 新苗创鸣</p>
          <h1>
            好想法，
            <br className="mobile-break" />
            在这里扎根。
            <Sprout aria-hidden="true" />
          </h1>
          <p>让青年创意遇见茶园资源，一起做成下一件事。</p>
        </div>
        <span className="matching-edition">
          YOUTH ×<br />
          TEA COUNTRY
        </span>
      </header>
      <div className="matching-launches">
        <button onClick={() => openForm("project")}>
          <span className="launch-icon">
            <Users />
          </span>
          <span>
            <small>我有一个想法</small>
            <strong>提交创业计划</strong>
          </span>
          <ArrowRight />
        </button>
        <button onClick={() => openForm("garden")}>
          <span className="launch-icon">
            <Building2 />
          </span>
          <span>
            <small>我有一片可能</small>
            <strong>发布茶园资源</strong>
          </span>
          <ArrowRight />
        </button>
      </div>
      <div className="matching-notice" role="status">
        {notice || "根据双方共同标签推荐 · 发布内容保存在当前浏览器"}
      </div>
      <section className="matching-board">
        <div className="matching-tabs" role="tablist" aria-label="合作资源">
          {tabs.map((item, index) => (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              role="tab"
              aria-controls={`panel-${item.id}`}
              aria-selected={tab === item.id}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => {
                if (
                  !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                    event.key,
                  )
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : (index +
                          (event.key === "ArrowRight" ? 1 : -1) +
                          tabs.length) %
                        tabs.length;
                setTab(tabs[next].id);
                document.getElementById(`tab-${tabs[next].id}`)?.focus();
              }}
            >
              {item.label}
              <span>{item.count}</span>
            </button>
          ))}
        </div>
        <div className="matching-filters" aria-label="按合作方向筛选">
          <span>合作方向</span>
          {["全部", ...matchTags].map((tag) => (
            <button
              key={tag}
              aria-pressed={filter === tag}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
          className="matching-results"
          tabIndex={0}
        >
          {tab === "matches"
            ? shownMatches.map((result) => (
                <MatchResultCard key={result.id} result={result} />
              ))
            : tab === "projects"
              ? shownProjects.map((project) => (
                  <article className="resource-card" key={project.id}>
                    <p className="work-eyebrow">
                      创业计划 / {project.createdAt}
                    </p>
                    <h2>{project.projectName}</h2>
                    <p>{project.teamIntro || "团队介绍待补充"}</p>
                    <div className="resource-tags">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <p>
                      <strong>寻找资源</strong>{" "}
                      {project.requiredResources || "待沟通"}
                    </p>
                    <details>
                      <summary>查看计划详情</summary>
                      <dl>
                        <dt>创业方向</dt>
                        <dd>{project.direction || "待沟通"}</dd>
                        <dt>合作方式</dt>
                        <dd>{project.cooperationMode || "待沟通"}</dd>
                        <dt>联系方式</dt>
                        <dd>{project.contact || "暂未填写"}</dd>
                        {project.attachmentName && (
                          <>
                            <dt>材料文件名</dt>
                            <dd>{project.attachmentName}（仅记录文件名）</dd>
                          </>
                        )}
                      </dl>
                    </details>
                  </article>
                ))
              : shownGardens.map((garden) => (
                  <article className="resource-card" key={garden.id}>
                    <p className="work-eyebrow">
                      茶园资源 / {garden.location || "地点待补充"}
                    </p>
                    <h2>{garden.gardenName}</h2>
                    <p>{garden.resources || "资源介绍待补充"}</p>
                    <div className="resource-tags">
                      {garden.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <p>
                      <strong>合作条件</strong>{" "}
                      {garden.cooperationTerms || "待沟通"}
                    </p>
                    <details>
                      <summary>查看茶园详情</summary>
                      <dl>
                        <dt>支持方向</dt>
                        <dd>{garden.supportedDirections || "待沟通"}</dd>
                        <dt>联系方式</dt>
                        <dd>{garden.contact || "暂未填写"}</dd>
                        {garden.mediaName && (
                          <>
                            <dt>材料文件名</dt>
                            <dd>{garden.mediaName}（仅记录文件名）</dd>
                          </>
                        )}
                      </dl>
                    </details>
                  </article>
                ))}
          {(tab === "matches"
            ? shownMatches
            : tab === "projects"
              ? shownProjects
              : shownGardens
          ).length === 0 && (
            <div className="matching-empty">
              <Sprout />
              <h2>这里还在等一颗新芽</h2>
              <p>
                当前方向暂无
                {tab === "matches"
                  ? "双方共同标签匹配"
                  : tab === "projects"
                    ? "创业计划"
                    : "茶园资源"}
                ，试试其他方向或发布一份资料。
              </p>
              <button onClick={() => setFilter("全部")}>查看全部方向</button>
            </div>
          )}
        </div>
      </section>
      <DialogWindow
        open={activeDialog === "project"}
        title="大学生创业计划提交"
        description="填写后将进入项目资源池，并立即参与标签匹配。"
        onClose={() => setActiveDialog(null)}
      >
        <form onSubmit={submitProject} className="matching-form">
          {formError && (
            <p role="alert" className="form-error">
              {formError}
            </p>
          )}
          <FormTitle
            icon={<Users className="h-5 w-5" />}
            title="01 / 基本资料"
          />
          <Field
            label="项目名称"
            value={projectForm.projectName}
            onChange={(value) =>
              setProjectForm({ ...projectForm, projectName: value })
            }
          />
          <Field
            label="团队介绍"
            textarea
            value={projectForm.teamIntro}
            onChange={(value) =>
              setProjectForm({ ...projectForm, teamIntro: value })
            }
          />
          <Field
            label="创业方向"
            value={projectForm.direction}
            onChange={(value) =>
              setProjectForm({ ...projectForm, direction: value })
            }
          />
          <h3 className="form-group-heading">02 / 合作需求</h3>
          <Field
            label="所需资源"
            textarea
            value={projectForm.requiredResources}
            onChange={(value) =>
              setProjectForm({ ...projectForm, requiredResources: value })
            }
          />
          <Field
            label="预期合作方式"
            value={projectForm.cooperationMode}
            onChange={(value) =>
              setProjectForm({ ...projectForm, cooperationMode: value })
            }
          />
          <Field
            label="联系方式"
            value={projectForm.contact}
            onChange={(value) =>
              setProjectForm({ ...projectForm, contact: value })
            }
          />
          <h3 className="form-group-heading">03 / 标签与材料</h3>
          <FileSlot
            label="附件或图片材料"
            fileName={projectForm.attachmentName}
            onChange={(fileName) =>
              setProjectForm({ ...projectForm, attachmentName: fileName })
            }
          />
          <div className="mt-5">
            <Label>匹配标签（至少一项）</Label>
            <TagPicker
              tags={matchTags}
              selectedTags={projectForm.tags}
              onChange={(tags) => setProjectForm({ ...projectForm, tags })}
            />
          </div>
          <DialogActions
            onCancel={() => setActiveDialog(null)}
            submitLabel="保存创业计划"
          />
        </form>
      </DialogWindow>

      <DialogWindow
        open={activeDialog === "garden"}
        title="茶园资源发布"
        description="填写后将进入茶园资源池，并立即与创业计划进行标签匹配。"
        onClose={() => setActiveDialog(null)}
      >
        <form onSubmit={submitGarden} className="matching-form">
          {formError && (
            <p role="alert" className="form-error">
              {formError}
            </p>
          )}
          <FormTitle
            icon={<Building2 className="h-5 w-5" />}
            title="01 / 基本资料"
          />
          <Field
            label="茶园名称"
            value={gardenForm.gardenName}
            onChange={(value) =>
              setGardenForm({ ...gardenForm, gardenName: value })
            }
          />
          <Field
            label="地理位置"
            value={gardenForm.location}
            onChange={(value) =>
              setGardenForm({ ...gardenForm, location: value })
            }
          />
          <h3 className="form-group-heading">02 / 合作需求</h3>
          <Field
            label="可提供资源"
            textarea
            value={gardenForm.resources}
            onChange={(value) =>
              setGardenForm({ ...gardenForm, resources: value })
            }
          />
          <Field
            label="可支持的创业方向"
            value={gardenForm.supportedDirections}
            onChange={(value) =>
              setGardenForm({ ...gardenForm, supportedDirections: value })
            }
          />
          <Field
            label="合作条件"
            textarea
            value={gardenForm.cooperationTerms}
            onChange={(value) =>
              setGardenForm({ ...gardenForm, cooperationTerms: value })
            }
          />
          <Field
            label="联系方式"
            value={gardenForm.contact}
            onChange={(value) =>
              setGardenForm({ ...gardenForm, contact: value })
            }
          />
          <h3 className="form-group-heading">03 / 标签与材料</h3>
          <FileSlot
            label="图片或视频资料"
            fileName={gardenForm.mediaName}
            onChange={(fileName) =>
              setGardenForm({ ...gardenForm, mediaName: fileName })
            }
          />
          <div className="mt-5">
            <Label>资源标签（至少一项）</Label>
            <TagPicker
              tags={matchTags}
              selectedTags={gardenForm.tags}
              onChange={(tags) => setGardenForm({ ...gardenForm, tags })}
            />
          </div>
          <DialogActions
            onCancel={() => setActiveDialog(null)}
            submitLabel="保存茶园资源"
          />
        </form>
      </DialogWindow>
    </div>
  );
}

function DialogWindow({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <WorkspaceDrawer open={open} title={title} onClose={onClose}>
      <p className="drawer-description">
        {description} 资料仅保存在当前浏览器，材料仅记录文件名。
      </p>
      {children}
    </WorkspaceDrawer>
  );
}

function DialogActions({
  onCancel,
  submitLabel,
}: {
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="tea-footer -mx-5 -mb-5 mt-7 flex flex-col-reverse gap-3 rounded-b-[2rem] px-5 py-5 sm:-mx-7 sm:-mb-7 sm:flex-row sm:justify-end sm:px-7">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-tea-ink/12 bg-white px-5 py-3 text-sm font-bold text-tea-ink/70 transition hover:bg-tea-mist"
      >
        取消
      </button>
      <button
        type="submit"
        className="rounded-full bg-tea-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-leaf"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function FormTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tea-mist text-tea-leaf">
        {icon}
      </span>
      <h3 className="text-2xl font-black text-tea-ink">{title}</h3>
    </div>
  );
}

function Label({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-bold text-tea-ink/70"
    >
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  const fieldId = useId();

  return (
    <div className="mt-4">
      <Label htmlFor={fieldId}>
        {label}
        {["项目名称", "茶园名称"].includes(label) ? " *" : ""}
      </Label>
      {textarea ? (
        <textarea
          id={fieldId}
          required={["项目名称", "茶园名称"].includes(label)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-2xl border border-tea-ink/10 bg-[#f7fbf3] px-4 py-3 text-sm outline-none transition focus:border-tea-leaf focus:bg-white"
        />
      ) : (
        <input
          id={fieldId}
          required={["项目名称", "茶园名称"].includes(label)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-tea-ink/10 bg-[#f7fbf3] px-4 py-3 text-sm outline-none transition focus:border-tea-leaf focus:bg-white"
        />
      )}
    </div>
  );
}

function FileSlot({
  label,
  fileName,
  onChange,
}: {
  label: string;
  fileName?: string;
  onChange: (fileName: string) => void;
}) {
  const inputId = useId();

  return (
    <div className="mt-4">
      <Label htmlFor={inputId}>{label}</Label>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-tea-leaf/28 bg-tea-mist/70 px-4 py-3 text-sm font-semibold text-tea-ink/62 transition hover:bg-tea-mist"
      >
        <span className="truncate">{fileName ?? "选择文件"}</span>
        <FileUp className="h-4 w-4 shrink-0 text-tea-leaf" />
        <input
          id={inputId}
          className="sr-only"
          type="file"
          onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
        />
      </label>
    </div>
  );
}
