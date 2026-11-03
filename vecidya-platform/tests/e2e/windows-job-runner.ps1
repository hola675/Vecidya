param([Parameter(Mandatory=$true)][string]$Executable,[Parameter(Mandatory=$true)][string]$ArgumentsBase64,[Parameter(Mandatory=$true)][string]$WorkingDirectory,[Parameter(Mandatory=$true)][string]$ControlFile)
$ErrorActionPreference = 'Stop'
$source = @"
using System;
using System.Runtime.InteropServices;
public static class VecidyaJobRunner {
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] public struct STARTUPINFO { public int cb; public string reserved; public string desktop; public string title; public int x; public int y; public int xSize; public int ySize; public int xCountChars; public int yCountChars; public int fill; public int flags; public short show; public short reserved2; public IntPtr reservedPtr; public IntPtr stdin; public IntPtr stdout; public IntPtr stderr; }
  [StructLayout(LayoutKind.Sequential)] public struct PROCESS_INFORMATION { public IntPtr process; public IntPtr thread; public int processId; public int threadId; }
  [StructLayout(LayoutKind.Sequential)] public struct IO_COUNTERS { public ulong readOps; public ulong writeOps; public ulong otherOps; public ulong readBytes; public ulong writeBytes; public ulong otherBytes; }
  [StructLayout(LayoutKind.Sequential)] public struct BASIC_LIMIT { public long perProcessTime; public long perJobTime; public uint limitFlags; public UIntPtr minWorkingSet; public UIntPtr maxWorkingSet; public uint activeProcessLimit; public UIntPtr affinity; public uint priorityClass; public uint schedulingClass; }
  [StructLayout(LayoutKind.Sequential)] public struct EXT_LIMIT { public BASIC_LIMIT basic; public IO_COUNTERS io; public UIntPtr processMemory; public UIntPtr jobMemory; public UIntPtr peakProcessMemory; public UIntPtr peakJobMemory; }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateProcess(string app, string cmd, IntPtr pa, IntPtr ta, bool inherit, uint flags, IntPtr env, string cwd, ref STARTUPINFO si, out PROCESS_INFORMATION pi);
  [DllImport("kernel32.dll", SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr attrs, string name);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool SetInformationJobObject(IntPtr job, int infoClass, ref EXT_LIMIT info, uint length);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);
  [DllImport("kernel32.dll", SetLastError=true)] static extern uint ResumeThread(IntPtr thread);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool GenerateConsoleCtrlEvent(uint type, uint processGroup);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool AttachConsole(uint processId);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool SetConsoleCtrlHandler(IntPtr handler, bool add);
  [DllImport("kernel32.dll", SetLastError=true)] static extern uint WaitForSingleObject(IntPtr handle, uint ms);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool GetExitCodeProcess(IntPtr process, out uint code);
  [StructLayout(LayoutKind.Sequential)] public struct BASIC_ACCOUNTING { public long userTime; public long kernelTime; public long periodUserTime; public long periodKernelTime; public uint pageFaults; public uint totalProcesses; public uint activeProcesses; public uint terminatedProcesses; }
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool QueryInformationJobObject(IntPtr job, int infoClass, out BASIC_ACCOUNTING info, uint length, IntPtr returned);
  [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
  [DllImport("kernel32.dll")] static extern IntPtr GetStdHandle(int id);
  static string Quote(string s) { if (s.Length==0) return "\"\""; if (!s.Contains(" ") && !s.Contains("\t") && !s.Contains("\"")) return s; var b=new System.Text.StringBuilder("\""); int n=0; foreach(char c in s) { if(c=='\\'){n++;continue;} if(c=='\"'){b.Append('\\',n*2+1).Append(c);n=0;continue;} b.Append('\\',n).Append(c);n=0;} b.Append('\\',n*2).Append('\"'); return b.ToString(); }
  public static int Run(string exe, string[] args, string cwd, string controlFile) {
    AttachConsole(0xffffffff); SetConsoleCtrlHandler(IntPtr.Zero,true); IntPtr job=CreateJobObject(IntPtr.Zero,null); if(job==IntPtr.Zero) throw new System.ComponentModel.Win32Exception();
    var limits=new EXT_LIMIT(); limits.basic.limitFlags=0x2000; if(!SetInformationJobObject(job,9,ref limits,(uint)Marshal.SizeOf(typeof(EXT_LIMIT)))) throw new System.ComponentModel.Win32Exception();
    var si=new STARTUPINFO(); si.cb=Marshal.SizeOf(typeof(STARTUPINFO)); si.flags=0x100; si.stdin=GetStdHandle(-10); si.stdout=GetStdHandle(-11); si.stderr=GetStdHandle(-12);
    var pi=new PROCESS_INFORMATION(); string cmd=Quote(exe); foreach(var a in args) cmd+=" "+Quote(a);
    if(!CreateProcess(exe,cmd,IntPtr.Zero,IntPtr.Zero,true,0x204,IntPtr.Zero,cwd,ref si,out pi)) throw new System.ComponentModel.Win32Exception();
    try { if(!AssignProcessToJobObject(job,pi.process)) throw new System.ComponentModel.Win32Exception(); if(ResumeThread(pi.thread)==0xffffffff) throw new System.ComponentModel.Win32Exception(); var control=new System.Threading.Thread(()=>{ while(WaitForSingleObject(pi.process,100)==0x102) { if(System.IO.File.Exists(controlFile)) { try { System.IO.File.Delete(controlFile); } catch {} if(!GenerateConsoleCtrlEvent(1,(uint)pi.processId)) Console.Error.WriteLine("No se pudo enviar CTRL_BREAK_EVENT a Wrangler."); } } }); control.IsBackground=true; control.Start(); while(WaitForSingleObject(pi.process,250)==0x102) {} uint code; if(!GetExitCodeProcess(pi.process,out code)) throw new System.ComponentModel.Win32Exception(); BASIC_ACCOUNTING accounting = new BASIC_ACCOUNTING(); bool empty=false; for(int i=0;i<50;i++){ if(!QueryInformationJobObject(job,1,out accounting,(uint)Marshal.SizeOf(typeof(BASIC_ACCOUNTING)),IntPtr.Zero)) throw new System.ComponentModel.Win32Exception(); if(accounting.activeProcesses==0){empty=true;break;} System.Threading.Thread.Sleep(100); } Console.Out.WriteLine(empty ? "JOB_CHILD_EXIT:graceful:"+code : "JOB_CHILD_EXIT:descendants-forced:"+accounting.activeProcesses); return (int)code; }
    finally { CloseHandle(pi.thread); CloseHandle(pi.process); CloseHandle(job); }
  }
}
"@
Add-Type -TypeDefinition $source
$args = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($ArgumentsBase64)) | ConvertFrom-Json
$exitCode = [VecidyaJobRunner]::Run($Executable,[string[]]$args,$WorkingDirectory,$ControlFile)
exit $exitCode
