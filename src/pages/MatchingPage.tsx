import { FormEvent, useEffect, useId, useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, FileUp, Users } from 'lucide-react';
import { Hero } from '../components/ui/Hero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { MatchResultCard } from '../components/matching/MatchResultCard';
import { TagPicker } from '../components/matching/TagPicker';
import { defaultGardenResources, defaultStudentProjects, heroAssets, matchTags } from '../data/mockData';
import { buildMatchResults } from '../lib/matching';
import { readStorage, writeStorage } from '../lib/storage';
import type { StudentProject, TeaGardenResource } from '../types/domain';

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

  useEffect(() => writeStorage(PROJECTS_KEY, projects), [projects]);
  useEffect(() => writeStorage(GARDENS_KEY, gardens), [gardens]);

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
  }

  return (
    <>
      <Hero
        eyebrow="新苗创鸣｜校企双选"
        title="让创业新苗找到真正适配的茶园土壤"
        description="以大学生创业计划、茶园资源发布和标签匹配为核心，先以前端本地存储完成交互闭环，后续可升级为审核、消息和真实推荐系统。"
        imageUrl={heroAssets.matching}
        primaryLabel="提交双选信息"
        secondaryLabel="查看匹配结果"
      />

      <section id="primary-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Submission Forms" title="双向发布与本地保存" description="当前提交内容保存到浏览器 LocalStorage，附件和图片只记录文件名，为后续真实上传接口预留。" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitProject} className="rounded-3xl bg-white p-6 shadow-soft">
            <FormTitle icon={<Users className="h-5 w-5" />} title="大学生创业计划提交" />
            <Field label="项目名称" value={projectForm.projectName} onChange={(value) => setProjectForm({ ...projectForm, projectName: value })} />
            <Field label="团队介绍" textarea value={projectForm.teamIntro} onChange={(value) => setProjectForm({ ...projectForm, teamIntro: value })} />
            <Field label="创业方向" value={projectForm.direction} onChange={(value) => setProjectForm({ ...projectForm, direction: value })} />
            <Field label="所需资源" textarea value={projectForm.requiredResources} onChange={(value) => setProjectForm({ ...projectForm, requiredResources: value })} />
            <Field label="预期合作方式" value={projectForm.cooperationMode} onChange={(value) => setProjectForm({ ...projectForm, cooperationMode: value })} />
            <Field label="联系方式" value={projectForm.contact} onChange={(value) => setProjectForm({ ...projectForm, contact: value })} />
            <FileSlot label="附件或图片上传占位" fileName={projectForm.attachmentName} onChange={(fileName) => setProjectForm({ ...projectForm, attachmentName: fileName })} />
            <div className="mt-5">
              <Label>匹配标签</Label>
              <TagPicker tags={matchTags} selectedTags={projectForm.tags} onChange={(tags) => setProjectForm({ ...projectForm, tags })} />
            </div>
            <button type="submit" className="mt-6 w-full rounded-full bg-tea-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-leaf">
              保存创业计划
            </button>
          </form>

          <form onSubmit={submitGarden} className="rounded-3xl bg-white p-6 shadow-soft">
            <FormTitle icon={<Building2 className="h-5 w-5" />} title="茶园资源发布" />
            <Field label="茶园名称" value={gardenForm.gardenName} onChange={(value) => setGardenForm({ ...gardenForm, gardenName: value })} />
            <Field label="地理位置" value={gardenForm.location} onChange={(value) => setGardenForm({ ...gardenForm, location: value })} />
            <Field label="可提供资源" textarea value={gardenForm.resources} onChange={(value) => setGardenForm({ ...gardenForm, resources: value })} />
            <Field label="可支持的创业方向" value={gardenForm.supportedDirections} onChange={(value) => setGardenForm({ ...gardenForm, supportedDirections: value })} />
            <Field label="合作条件" textarea value={gardenForm.cooperationTerms} onChange={(value) => setGardenForm({ ...gardenForm, cooperationTerms: value })} />
            <Field label="联系方式" value={gardenForm.contact} onChange={(value) => setGardenForm({ ...gardenForm, contact: value })} />
            <FileSlot label="图片或视频资料占位" fileName={gardenForm.mediaName} onChange={(fileName) => setGardenForm({ ...gardenForm, mediaName: fileName })} />
            <div className="mt-5">
              <Label>资源标签</Label>
              <TagPicker tags={matchTags} selectedTags={gardenForm.tags} onChange={(tags) => setGardenForm({ ...gardenForm, tags })} />
            </div>
            <button type="submit" className="mt-6 w-full rounded-full bg-tea-leaf px-5 py-3 text-sm font-bold text-white transition hover:bg-tea-ink">
              保存茶园资源
            </button>
          </form>
        </div>
      </section>

      <section id="resource-slots" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Matching Results" title="标签匹配结果" description="根据文旅、直播带货、茶产品设计、研学活动、品牌策划、数字农业等标签进行轻量推荐。" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard icon={<BriefcaseBusiness className="h-5 w-5" />} label="创业计划" value={projects.length} />
            <StatCard icon={<Building2 className="h-5 w-5" />} label="茶园资源" value={gardens.length} />
            <StatCard icon={<FileUp className="h-5 w-5" />} label="有效匹配" value={matchResults.length} />
          </div>
          <div className="mt-8 grid gap-5">
            {matchResults.length > 0 ? (
              matchResults.slice(0, 6).map((result) => <MatchResultCard key={result.id} result={result} />)
            ) : (
              <div className="rounded-3xl bg-[#f7fbf3] p-8 text-center text-tea-ink/62">暂无标签重合结果，请至少为双方各选择一个相同标签。</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function FormTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tea-mist text-tea-leaf">{icon}</span>
      <h2 className="text-2xl font-black text-tea-ink">{title}</h2>
    </div>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-tea-ink/70">
      {children}
    </label>
  );
}

function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
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
      <label htmlFor={inputId} className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-tea-leaf/28 bg-tea-mist/70 px-4 py-3 text-sm font-semibold text-tea-ink/62 transition hover:bg-tea-mist">
        <span className="truncate">{fileName ?? '选择文件，仅记录文件名'}</span>
        <FileUp className="h-4 w-4 shrink-0 text-tea-leaf" />
        <input id={inputId} className="sr-only" type="file" onChange={(event) => onChange(event.target.files?.[0]?.name ?? '')} />
      </label>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-[#f7fbf3] p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-tea-leaf">{icon}</span>
        <span className="text-3xl font-black text-tea-ink">{value}</span>
      </div>
      <p className="mt-4 text-sm font-bold text-tea-ink/58">{label}</p>
    </div>
  );
}
