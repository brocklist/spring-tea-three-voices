import { FormEvent, ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Building2, FileUp, Sprout, Users, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Hero } from '../components/ui/Hero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MatchResultCard } from '../components/matching/MatchResultCard';
import { TagPicker } from '../components/matching/TagPicker';
import { defaultGardenResources, defaultStudentProjects, heroAssets, matchTags } from '../data/mockData';
import { buildMatchResults } from '../lib/matching';
import { readStorage, writeStorage } from '../lib/storage';
import type { StudentProject, TeaGardenResource } from '../types/domain';
import { dialogSpring } from '../lib/motion';

const PROJECTS_KEY = 'spring-tea-student-projects';
const GARDENS_KEY = 'spring-tea-garden-resources';

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

type DialogType = 'project' | 'garden' | null;

const emptyProjectForm: ProjectFormState = {
  projectName: '',
  teamIntro: '',
  direction: '',
  requiredResources: '',
  cooperationMode: '',
  contact: '',
  tags: [],
};

const emptyGardenForm: GardenFormState = {
  gardenName: '',
  location: '',
  resources: '',
  supportedDirections: '',
  cooperationTerms: '',
  contact: '',
  tags: [],
};

export function MatchingPage() {
  const [projects, setProjects] = useState<StudentProject[]>(() => readStorage(PROJECTS_KEY, defaultStudentProjects));
  const [gardens, setGardens] = useState<TeaGardenResource[]>(() => readStorage(GARDENS_KEY, defaultGardenResources));
  const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm);
  const [gardenForm, setGardenForm] = useState<GardenFormState>(emptyGardenForm);
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  useEffect(() => writeStorage(PROJECTS_KEY, projects), [projects]);
  useEffect(() => writeStorage(GARDENS_KEY, gardens), [gardens]);

  useEffect(() => {
    if (!activeDialog) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDialog(null);
      }
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeDialog]);

  const matchResults = useMemo(() => buildMatchResults(projects, gardens), [projects, gardens]);

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectForm.projectName.trim() || projectForm.tags.length === 0) {
      return;
    }

    const nextProject: StudentProject = {
      id: `student-${Date.now()}`,
      ...projectForm,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setProjects((items) => [nextProject, ...items]);
    setProjectForm(emptyProjectForm);
    setActiveDialog(null);
  }

  function submitGarden(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gardenForm.gardenName.trim() || gardenForm.tags.length === 0) {
      return;
    }

    const nextGarden: TeaGardenResource = {
      id: `garden-${Date.now()}`,
      ...gardenForm,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setGardens((items) => [nextGarden, ...items]);
    setGardenForm(emptyGardenForm);
    setActiveDialog(null);
  }

  return (
    <>
      <Hero
        eyebrow="新苗创鸣｜校企双选"
        title="让创业新苗找到真正适配的茶园土壤"
        description="以大学生创业计划、茶园资源发布和标签匹配为核心，连接青年创意与乡村茶园资源。"
        imageUrl={heroAssets.matching}
        primaryLabel="打开发布窗口"
        secondaryLabel="查看匹配结果"
      />

      <section id="primary-section" className="section-shell py-16">
        <SectionHeader
          eyebrow="Submission Hub"
          title="双向发布入口"
          description="页面展示双向发布入口与资源状态，点击后进入独立窗口填写创业计划或茶园资源信息。"
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <LaunchCard
            icon={<Users className="h-6 w-6" />}
            title="大学生创业计划"
            description="提交项目名称、团队介绍、所需资源与合作方式，由系统与茶园资源做标签匹配。"
            meta={`${projects.length} 份计划已在资源池`}
            actionLabel="提交创业计划"
            onClick={() => setActiveDialog('project')}
          />
          <LaunchCard
            icon={<Building2 className="h-6 w-6" />}
            title="茶园资源发布"
            description="发布茶园场地、支持方向与合作条件，方便创业团队快速理解可合作资源。"
            meta={`${gardens.length} 个茶园资源已入库`}
            actionLabel="发布茶园资源"
            onClick={() => setActiveDialog('garden')}
          />
        </div>
      </section>

      <section id="resource-slots" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Matching Results"
            title="标签匹配结果"
            description="根据文旅、直播带货、茶产品设计、研学活动、品牌策划、数字农业等标签进行轻量推荐。"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard icon={<BriefcaseBusiness className="h-5 w-5" />} label="创业计划" value={projects.length} />
            <StatCard icon={<Building2 className="h-5 w-5" />} label="茶园资源" value={gardens.length} />
            <StatCard icon={<FileUp className="h-5 w-5" />} label="有效匹配" value={matchResults.length} />
          </div>
          <div className="mt-8 grid gap-5">
            {matchResults.length > 0 ? (
              matchResults.slice(0, 6).map((result) => <MatchResultCard key={result.id} result={result} />)
            ) : (
              <div className="rounded-3xl bg-[#f7fbf3] p-8 text-center text-tea-ink/62">
                暂无标签重合结果，请至少为双方各选择一个相同标签。
              </div>
            )}
          </div>
        </div>
      </section>

      <DialogWindow
        open={activeDialog === 'project'}
        title="大学生创业计划提交"
        description="填写后将进入项目资源池，并立即参与标签匹配。"
        onClose={() => setActiveDialog(null)}
      >
        <form onSubmit={submitProject}>
          <FormTitle icon={<Users className="h-5 w-5" />} title="计划信息" />
          <Field label="项目名称" value={projectForm.projectName} onChange={(value) => setProjectForm({ ...projectForm, projectName: value })} />
          <Field label="团队介绍" textarea value={projectForm.teamIntro} onChange={(value) => setProjectForm({ ...projectForm, teamIntro: value })} />
          <Field label="创业方向" value={projectForm.direction} onChange={(value) => setProjectForm({ ...projectForm, direction: value })} />
          <Field label="所需资源" textarea value={projectForm.requiredResources} onChange={(value) => setProjectForm({ ...projectForm, requiredResources: value })} />
          <Field label="预期合作方式" value={projectForm.cooperationMode} onChange={(value) => setProjectForm({ ...projectForm, cooperationMode: value })} />
          <Field label="联系方式" value={projectForm.contact} onChange={(value) => setProjectForm({ ...projectForm, contact: value })} />
          <FileSlot label="附件或图片材料" fileName={projectForm.attachmentName} onChange={(fileName) => setProjectForm({ ...projectForm, attachmentName: fileName })} />
          <div className="mt-5">
            <Label>匹配标签</Label>
            <TagPicker tags={matchTags} selectedTags={projectForm.tags} onChange={(tags) => setProjectForm({ ...projectForm, tags })} />
          </div>
          <DialogActions onCancel={() => setActiveDialog(null)} submitLabel="保存创业计划" />
        </form>
      </DialogWindow>

      <DialogWindow
        open={activeDialog === 'garden'}
        title="茶园资源发布"
        description="填写后将进入茶园资源池，并立即与创业计划进行标签匹配。"
        onClose={() => setActiveDialog(null)}
      >
        <form onSubmit={submitGarden}>
          <FormTitle icon={<Building2 className="h-5 w-5" />} title="资源信息" />
          <Field label="茶园名称" value={gardenForm.gardenName} onChange={(value) => setGardenForm({ ...gardenForm, gardenName: value })} />
          <Field label="地理位置" value={gardenForm.location} onChange={(value) => setGardenForm({ ...gardenForm, location: value })} />
          <Field label="可提供资源" textarea value={gardenForm.resources} onChange={(value) => setGardenForm({ ...gardenForm, resources: value })} />
          <Field label="可支持的创业方向" value={gardenForm.supportedDirections} onChange={(value) => setGardenForm({ ...gardenForm, supportedDirections: value })} />
          <Field label="合作条件" textarea value={gardenForm.cooperationTerms} onChange={(value) => setGardenForm({ ...gardenForm, cooperationTerms: value })} />
          <Field label="联系方式" value={gardenForm.contact} onChange={(value) => setGardenForm({ ...gardenForm, contact: value })} />
          <FileSlot label="图片或视频资料" fileName={gardenForm.mediaName} onChange={(fileName) => setGardenForm({ ...gardenForm, mediaName: fileName })} />
          <div className="mt-5">
            <Label>资源标签</Label>
            <TagPicker tags={matchTags} selectedTags={gardenForm.tags} onChange={(tags) => setGardenForm({ ...gardenForm, tags })} />
          </div>
          <DialogActions onCancel={() => setActiveDialog(null)} submitLabel="保存茶园资源" />
        </form>
      </DialogWindow>
    </>
  );
}

function LaunchCard({
  icon,
  title,
  description,
  meta,
  actionLabel,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  onClick: () => void;
}) {
  return (
    <article className="tea-card rounded-3xl p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tea-mist text-tea-leaf">{icon}</span>
        <span className="rounded-full bg-tea-spring/18 px-3 py-1 text-xs font-black text-tea-leaf">{meta}</span>
      </div>
      <h2 className="mt-6 text-2xl font-black text-tea-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-tea-ink/66">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="tea-footer mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-tea-ink transition hover:bg-tea-mist"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
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
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
      >
      <motion.button
        type="button"
        aria-label="关闭窗口"
        className="absolute inset-0 bg-tea-ink/62 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="matching-dialog-title"
        className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
        transition={reducedMotion ? { duration: 0.1 } : dialogSpring}
      >
        <div className="sticky top-0 z-10 -mx-5 -mt-5 flex items-start justify-between gap-4 border-b border-tea-ink/8 bg-white/96 px-5 py-5 backdrop-blur sm:-mx-7 sm:-mt-7 sm:px-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-tea-mist px-3 py-1 text-xs font-black text-tea-leaf">
              <Sprout className="h-3.5 w-3.5" />
              二级填写窗口
            </div>
            <h2 id="matching-dialog-title" className="mt-3 text-2xl font-black text-tea-ink">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-tea-ink/62">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tea-mist text-tea-ink transition hover:bg-tea-ink hover:text-white"
            aria-label="关闭窗口"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-6">{children}</div>
      </motion.section>
    </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DialogActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="tea-footer -mx-5 -mb-5 mt-7 flex flex-col-reverse gap-3 rounded-b-[2rem] px-5 py-5 sm:-mx-7 sm:-mb-7 sm:flex-row sm:justify-end sm:px-7">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-tea-ink/12 bg-white px-5 py-3 text-sm font-bold text-tea-ink/70 transition hover:bg-tea-mist"
      >
        取消
      </button>
      <button type="submit" className="rounded-full bg-tea-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-leaf">
        {submitLabel}
      </button>
    </div>
  );
}

function FormTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tea-mist text-tea-leaf">{icon}</span>
      <h3 className="text-2xl font-black text-tea-ink">{title}</h3>
    </div>
  );
}

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-tea-ink/70">
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
      <Label htmlFor={fieldId}>{label}</Label>
      {textarea ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-2xl border border-tea-ink/10 bg-[#f7fbf3] px-4 py-3 text-sm outline-none transition focus:border-tea-leaf focus:bg-white"
        />
      ) : (
        <input
          id={fieldId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-tea-ink/10 bg-[#f7fbf3] px-4 py-3 text-sm outline-none transition focus:border-tea-leaf focus:bg-white"
        />
      )}
    </div>
  );
}

function FileSlot({ label, fileName, onChange }: { label: string; fileName?: string; onChange: (fileName: string) => void }) {
  const inputId = useId();

  return (
    <div className="mt-4">
      <Label htmlFor={inputId}>{label}</Label>
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-tea-leaf/28 bg-tea-mist/70 px-4 py-3 text-sm font-semibold text-tea-ink/62 transition hover:bg-tea-mist"
      >
        <span className="truncate">{fileName ?? '选择文件'}</span>
        <FileUp className="h-4 w-4 shrink-0 text-tea-leaf" />
        <input id={inputId} className="sr-only" type="file" onChange={(event) => onChange(event.target.files?.[0]?.name ?? '')} />
      </label>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="tea-footer rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-tea-leaf">{icon}</span>
        <span className="text-3xl font-black text-tea-ink">{value}</span>
      </div>
      <p className="mt-4 text-sm font-bold text-tea-ink/58">{label}</p>
    </div>
  );
}
