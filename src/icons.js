// Ícones de traço fino (Lucide). Para usar um ícone novo no content.json,
// importe-o aqui e acrescente ao objeto ICONS.
import {
  Share2, QrCode, Download, List, X, ChevronRight, ChevronLeft, ArrowRight, Play, Scale, Landmark,
  FileText, CalendarClock, Users, ClipboardList, Briefcase, LayoutDashboard, ShieldCheck, Lock, Leaf,
  Copy, Check, Gavel, Building2, Handshake, Calculator, Globe, FileSignature, Fingerprint, MessagesSquare,
  Layers, Unplug, Clock, FolderOpen, Instagram, Linkedin, MessageCircle, Info, Vote, Compass, Target,
  BookOpen, CircleCheck, CircleX, TriangleAlert, CircleDot, Eye, RotateCcw, House
} from 'lucide';

const ICONS = {
  Share2, QrCode, Download, List, X, ChevronRight, ChevronLeft, ArrowRight, Play, Scale, Landmark,
  FileText, CalendarClock, Users, ClipboardList, Briefcase, LayoutDashboard, ShieldCheck, Lock, Leaf,
  Copy, Check, Gavel, Building2, Handshake, Calculator, Globe, FileSignature, Fingerprint, MessagesSquare,
  Layers, Unplug, Clock, FolderOpen, Instagram, Linkedin, MessageCircle, Info, Vote, Compass, Target,
  BookOpen, CircleCheck, CircleX, TriangleAlert, CircleDot, Eye, RotateCcw, House
};

function node([tag, attrs, children]) {
  const a = Object.entries(attrs || {}).map(([k, v]) => `${k}="${v}"`).join(' ');
  const inner = (children || []).map(node).join('');
  return `<${tag} ${a}>${inner}</${tag}>`;
}

export function icon(name, cls = '') {
  const def = ICONS[name] || ICONS.Info;
  const [, , children] = def;
  const inner = children.map(node).join('');
  return `<svg class="ic ${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
}
