import React, { useState } from 'react';
import { Network, AlertCircle, CheckCircle2, ChevronRight, ChevronDown, Braces } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [inputVal, setInputVal] = useState('["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X", "P->Q", "Q->R", "G->H", "G->H", "G->I", "hello", "1->2", "A->"]');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setResponse(null);
    
    let parsedData = [];
    try {
      // Try parsing as JSON first
      const possiblyJson = JSON.parse(inputVal);
      parsedData = possiblyJson.data || possiblyJson;
      if (!Array.isArray(parsedData)) {
        throw new Error('Parsed data must be an array of strings in \'data\' field.');
      }
    } catch {
      // Fallback to manual line/comma splitting
      const items = inputVal.split(/[,\\n]+/).map(i => i.trim().replace(/^["']|["']$/g, '')).filter(i => i);
      parsedData = items;
    }

    if (parsedData.length === 0) {
      setError('Please provide a valid list of nodes.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData }),
      });
      console.log(res);

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans selection:bg-accent/30 selection:text-text-main">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Input Panel */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center space-x-3 text-accent mb-2">
              <Network className="w-8 h-8" />
              <h1 className="text-3xl font-serif tracking-wide text-text-main">Hierarchify</h1>
            </div>
            <p className="text-text-dim text-sm leading-relaxed">
              Enter an array of node relations (e.g., <code className="text-accent font-mono">A-&gt;B</code>) to process hierarchies, detect cycles, and extract metrics.
            </p>
          </div>

          <div className="flex flex-col flex-grow">
            <div className="bg-surface rounded-sm border border-border-subtle overflow-hidden flex flex-col flex-grow relative">
              <div className="bg-surface px-4 py-3 border-b border-border-subtle flex items-center space-x-2">
                <Braces className="w-4 h-4 text-text-dim" />
                <span className="text-xs font-semibold text-text-dim tracking-[0.1em] uppercase">Request Body</span>
              </div>
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={'{"data": ["A->B", "B->C"]}'}
                className="w-full bg-transparent text-text-main text-sm font-mono p-5 h-80 lg:h-full focus:outline-none focus:ring-inset focus:ring-1 focus:ring-accent/50 resize-y"
                spellCheck={false}
              />
              <div className="p-4 border-t border-border-subtle bg-bg/50">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-transparent border border-border-subtle hover:border-accent hover:text-text-main text-accent uppercase tracking-[0.1em] text-xs font-semibold py-3 px-4 rounded-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Processing...' : 'Process Network'}</span>
                  {!loading && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-surface border border-danger/20 rounded-sm p-4 flex items-start space-x-3 text-danger"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-[11px] font-mono tracking-wide">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Output Panel */}
        <div className="flex flex-col space-y-6">
          <div className="bg-surface rounded-sm border border-border-subtle min-h-[400px] flex flex-col overflow-hidden">
            <div className="bg-surface px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <span className="text-xs font-semibold text-text-dim tracking-[0.1em] uppercase flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>API Response</span>
              </span>
            </div>

            <div className="p-5 flex-grow overflow-y-auto custom-scrollbar">
              {!response ? (
                <div className="h-full flex items-center justify-center text-text-dim text-sm italic">
                  Results will appear here
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <SummarySection response={response} />
                  
                  {response.hierarchies?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-semibold tracking-[0.1em] text-text-dim uppercase">Hierarchies</h3>
                      <div className="space-y-4">
                        {response.hierarchies.map((h: any, i: number) => (
                          <HierarchyCard key={i} h={h} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(response.invalid_entries?.length > 0 || response.duplicate_edges?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {response.invalid_entries?.length > 0 && (
                        <div className="bg-bg border border-danger/20 rounded-sm p-4">
                          <h4 className="text-[10px] font-semibold text-danger mb-2 uppercase tracking-[0.1em]">Invalid Entries</h4>
                          <div className="flex flex-wrap gap-2">
                            {response.invalid_entries.map((req: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-surface text-danger font-mono text-xs rounded-sm border border-danger/20">{req}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {response.duplicate_edges?.length > 0 && (
                        <div className="bg-bg border border-accent/20 rounded-sm p-4">
                          <h4 className="text-[10px] font-semibold text-accent mb-2 uppercase tracking-[0.1em]">Duplicate Edges</h4>
                          <div className="flex flex-wrap gap-2">
                            {response.duplicate_edges.map((req: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-surface text-accent font-mono text-xs rounded-sm border border-accent/20">{req}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-8 pt-4 border-t border-border-subtle">
                    <pre className="text-[10px] text-text-dim font-mono overflow-x-auto p-4 bg-bg rounded-sm border border-border-subtle">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SummarySection: React.FC<{ response: any }> = ({ response }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MetricCard label="Total Trees" value={response.summary?.total_trees || 0} />
      <MetricCard label="Total Cycles" value={response.summary?.total_cycles || 0} />
      <MetricCard label="Largest Root" value={response.summary?.largest_tree_root || "N/A"} highlight />
      <MetricCard label="Identifier" value={response.user_id?.split('_')[0] || "User"} small />
    </div>
  );
}

const MetricCard: React.FC<{ label: string; value: string | number; highlight?: boolean; small?: boolean }> = ({ label, value, highlight, small }) => {
  return (
    <div className="bg-surface border border-border-subtle rounded-sm p-4 flex flex-col justify-center">
      <div className="text-[10px] uppercase tracking-[0.1em] text-text-dim mb-2">{label}</div>
      <div className={`font-serif ${highlight ? 'text-accent' : 'text-text-main'} ${small ? 'text-sm truncate' : 'text-2xl font-light'}`}>
        {value}
      </div>
    </div>
  );
}

const HierarchyCard: React.FC<{ h: any, index: number }> = ({ h, index }) => {
  return (
    <div className="bg-surface rounded-sm border border-border-subtle p-4 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <span className="bg-bg border border-border-subtle text-accent font-mono px-2 py-0.5 rounded-sm text-[10px] tracking-wider uppercase">
            {h.root}
          </span>
          {h.has_cycle && (
            <span className="bg-bg text-danger text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-sm border border-danger/20">
              Cyclic Group
            </span>
          )}
        </div>
        {!h.has_cycle && h.depth && (
          <div className="text-[10px] uppercase tracking-wider text-text-dim">
            Depth: <span className="text-text-main">{h.depth}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle">
        {h.has_cycle ? (
          <div className="text-xs text-text-dim italic">No valid nested tree due to cycle.</div>
        ) : (
          <TreeViewer nodeName={h.root} treeNode={h.tree ? h.tree[h.root] : {}} />
        )}
      </div>
    </div>
  );
}

const TreeViewer: React.FC<{ nodeName: string, treeNode: any }> = ({ nodeName, treeNode }) => {
  const children = Object.keys(treeNode || {});
  const [expanded, setExpanded] = useState(true);

  if (children.length === 0) {
    return (
      <div className="flex items-center space-x-2 py-1">
        <div className="w-[1px] h-3 bg-border-subtle ml-1 mr-1"></div>
        <span className="font-mono text-[11px] text-text-main">{nodeName}</span>
      </div>
    );
  }

  return (
    <div className="py-1">
      <div 
        className="flex items-center space-x-2 cursor-pointer group hover:bg-bg border border-transparent hover:border-border-subtle rounded-sm -ml-2 p-1"
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronDown className={`w-3 h-3 text-text-dim transition-transform ${expanded ? '' : '-rotate-90'}`} />
        <span className="font-mono text-[11px] text-accent uppercase tracking-wider">{nodeName}</span>
        <span className="text-[10px] text-text-dim font-mono">({children.length} {children.length === 1 ? 'child' : 'children'})</span>
      </div>
      
      {expanded && (
        <div className="ml-[9px] mt-1 border-l border-border-subtle pl-4 space-y-1">
          {children.map(child => (
            <TreeViewer key={child} nodeName={child} treeNode={treeNode[child]} />
          ))}
        </div>
      )}
    </div>
  );
}
