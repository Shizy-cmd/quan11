import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Copy, Paperclip, Upload, X } from "lucide-react";

import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useContentStore } from "@/lib/store";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "权益反馈 | 学生权益中心" },
      {
        name: "description",
        content: "提交你在校园中遇到的权益问题，学生权益中心将全程跟进处理。",
      },
      { property: "og:title", content: "权益反馈 | 学生权益中心" },
      {
        property: "og:description",
        content: "分类、地点、详情、附件，一次提交，全程跟进。",
      },
    ],
  }),
  component: FeedbackPage,
});

const CATEGORIES = [
  { value: "dorm", label: "学生公寓" },
  { value: "teaching", label: "教学楼" },
  { value: "canteen", label: "食堂" },
  { value: "market", label: "教育超市" },
  { value: "campus", label: "校园环境" },
  { value: "library", label: "图书馆" },
  { value: "other", label: "其他" },
];

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function defaultOccurredAt() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:00`;
}

function FeedbackPage() {
  const store = useContentStore();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(defaultOccurredAt());
  const [detail, setDetail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const phoneOk = /^1\d{10}$/.test(contact.trim());

  const canSubmit = useMemo(
    () =>
      phoneOk &&
      category &&
      occurredAt &&
      detail.trim().length >= 10,
    [phoneOk, category, occurredAt, detail],
  );

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const merged = [...files];
    for (const f of incoming) {
      if (merged.length >= MAX_FILES) {
        toast.error(`最多上传 ${MAX_FILES} 个附件`);
        break;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} 超过 10MB`);
        continue;
      }
      merged.push(f);
    }
    setFiles(merged);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const record = store.addFeedback({
      name: name.trim() || undefined,
      contact: contact.trim(),
      category,
      occurredAt,
      detail: detail.trim(),
      attachments: files.map((f) => ({ name: f.name, size: f.size })),
    });
    setTicket(record.id);
    setSubmitting(false);
  }

  function resetForm() {
    setName("");
    setContact("");
    setCategory("");
    setOccurredAt(defaultOccurredAt());
    setDetail("");
    setFiles([]);
    setTicket(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
            <p className="text-xs font-medium tracking-widest text-primary">FEEDBACK · 权益反馈</p>
            <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              有问题，就来这里反馈
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              请如实填写以下信息。提交后系统将自动生成问题单号，你可在「进度查询」中随时查看处理进展。
              带 <span className="text-destructive">*</span> 为必填项。
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {ticket ? (
            <SuccessCard ticket={ticket} onReset={resetForm} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
            >
              <Field label="姓名" hint="选填，可匿名提交">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 30))}
                  placeholder="选填"
                  className="h-11"
                />
              </Field>

              <Field
                label="联系方式"
                required
                hint="请输入 11 位手机号，便于工作人员回访"
              >
                <Input
                  value={contact}
                  onChange={(e) =>
                    setContact(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  placeholder="请输入手机号"
                  inputMode="numeric"
                  className="h-11"
                />
                {contact && !phoneOk && (
                  <p className="mt-1 text-xs text-destructive">
                    请输入正确的 11 位手机号
                  </p>
                )}
              </Field>

              <Field label="问题类型" required hint="选择最贴近的类别，便于流转至对应部门">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="请选择问题类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="发生时间" required hint="精确到小时">
                <Input
                  type="datetime-local"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  step={3600}
                  className="h-11"
                />
              </Field>

              <Field
                label="问题描述"
                required
                hint="请描述发生地点、经过、影响，越具体越有助于处理（不少于 10 字）"
              >
                <Textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value.slice(0, 800))}
                  placeholder="请描述问题的具体情况……"
                  rows={6}
                  className="resize-none"
                />
                <p className="mt-1 text-right text-[11px] text-muted-foreground">
                  {detail.length}/800
                </p>
              </Field>

              <Field label="附件" hint={`选填，支持图片 / 文档，最多 ${MAX_FILES} 个，单个不超过 10MB`}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors hover:border-primary/60 hover:bg-muted"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">点击选择或拖拽文件到此处</p>
                  <p className="text-xs text-muted-foreground">
                    照片、截图、录音、PDF 等均可
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm text-foreground">{f.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatSize(f.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`移除 ${f.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  提交即表示你已阅读并同意《学生权益中心处理规范》
                </p>
                <Button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="h-11 rounded-full px-8 text-sm font-medium"
                >
                  {submitting ? "提交中…" : "提交反馈"}
                </Button>
              </div>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <Label className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="ml-1 align-super text-destructive">*</span>}
        </Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SuccessCard({ ticket, onReset }: { ticket: string; onReset: () => void }) {
  function copyId() {
    navigator.clipboard?.writeText(ticket);
    toast.success("单号已复制");
  }
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-foreground">反馈提交成功</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        我们已收到你的反馈，工作人员将在 2 个工作日内响应。
      </p>
      <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-muted/60 px-5 py-3">
        <span className="text-xs text-muted-foreground">问题单号</span>
        <span className="font-mono text-base font-semibold tracking-wider text-foreground">
          {ticket}
        </span>
        <button
          type="button"
          onClick={copyId}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label="复制单号"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        请妥善保存单号，你可凭此在「进度查询」中查看处理进展。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-full px-6"
          onClick={onReset}
        >
          再提交一条
        </Button>
        <a
          href="/progress"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          前往进度查询
        </a>
      </div>
    </div>
  );
}
