import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Image as ImageIcon, Video, AlignLeft,
  AlignCenter, AlignRight, Minus, FileCode,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "@/hooks/use-toast";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarBtn({ onClick, active, disabled, children, title }: { onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-primary/20 transition-colors ${active ? "bg-primary/30 text-primary" : "text-foreground/70"} disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const { token } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, HTMLAttributes: { class: "rounded-lg max-w-full my-4" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: "rounded-lg my-4 mx-auto" } }),
      Placeholder.configure({ placeholder: "Започни да пишеш статията си тук... :)" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
  });

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!token) return null;
    const form = new FormData();
    form.append("file", file);
    try {
      const { data, error } = await supabase.functions.invoke("admin-upload", {
        body: form,
        headers: { "x-admin-token": token },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.url ?? null;
    } catch (e) {
      toast({ title: "Грешка при качване", description: String((e as Error).message ?? e), variant: "destructive" });
      return null;
    }
  }, [token]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const url = await uploadFile(file);
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    const url = await uploadFile(file);
    if (url) {
      // Insert video tag via raw HTML
      editor.chain().focus().insertContent(
        `<video controls src="${url}" class="rounded-lg max-w-full my-4" style="max-height:480px"></video><p></p>`
      ).run();
    }
  };

  const addLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL на линка:", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addYoutube = () => {
    if (!editor) return;
    const url = window.prompt("YouTube URL:");
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  if (!editor) return <div className="text-muted-foreground">Зареждане на едитора...</div>;

  return (
    <div className="border border-border rounded-lg bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-card/60 sticky top-0 z-10">
        <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold size={16} /></ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic size={16} /></ToolbarBtn>
        <ToolbarBtn title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon size={16} /></ToolbarBtn>
        <ToolbarBtn title="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><Strikethrough size={16} /></ToolbarBtn>
        <ToolbarBtn title="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}><Code size={16} /></ToolbarBtn>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <ToolbarBtn title="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}><Heading1 size={16} /></ToolbarBtn>
        <ToolbarBtn title="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 size={16} /></ToolbarBtn>
        <ToolbarBtn title="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 size={16} /></ToolbarBtn>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <ToolbarBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List size={16} /></ToolbarBtn>
        <ToolbarBtn title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered size={16} /></ToolbarBtn>
        <ToolbarBtn title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote size={16} /></ToolbarBtn>
        <ToolbarBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><FileCode size={16} /></ToolbarBtn>
        <ToolbarBtn title="HR" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolbarBtn>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <ToolbarBtn title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><AlignLeft size={16} /></ToolbarBtn>
        <ToolbarBtn title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><AlignCenter size={16} /></ToolbarBtn>
        <ToolbarBtn title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}><AlignRight size={16} /></ToolbarBtn>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <ToolbarBtn title="Линк" onClick={addLink} active={editor.isActive("link")}><LinkIcon size={16} /></ToolbarBtn>
        <ToolbarBtn title="Качи снимка" onClick={() => fileInputRef.current?.click()}><ImageIcon size={16} /></ToolbarBtn>
        <ToolbarBtn title="Качи видео" onClick={() => videoInputRef.current?.click()}><Video size={16} /></ToolbarBtn>
        <ToolbarBtn title="YouTube" onClick={addYoutube}><span className="text-xs font-bold px-1">YT</span></ToolbarBtn>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={16} /></ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={16} /></ToolbarBtn>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideoUpload} />
      <EditorContent editor={editor} />
    </div>
  );
}
