import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '@/app/providers/StateContext';
import { 
  Shield, Users, Search, UserPlus, Lock, CheckSquare, Square, 
  Edit3, ArrowRight, ShieldCheck, Trash2, Mail, MapPin, Sliders, 
  ChevronLeft, ChevronRight, Check, Loader2, X, Phone, Settings, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/shared/store/auth.store';
import { 
  useRoles, 
  useMembers, 
  useCreateRole, 
  useToggleRolePermission, 
  useInviteMember, 
  useUpdateMember, 
  useDeleteMember, 
  useUpdateMemberBranches 
} from '@/shared/hooks/useTeam';
import { useBranches } from '@/shared/hooks/useBranches';
import { MemberResponse } from '@/shared/api/team.service';

export default function MerchantTeam() {
  const { user } = useAuthStore();
  const { addActivityLog } = useAppState();

  const [activeTab, setActiveTab] = useState<'permissions' | 'directory'>('permissions');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  // React Query queries
  const { data: roles = [], isLoading: isLoadingRoles, error: errorRoles } = useRoles();
  const { data: branches = [], isLoading: isLoadingBranches, error: errorBranches } = useBranches(user?.restaurantId);

  const queryFilters = useMemo(() => {
    return {
      roleId: roleFilter !== 'All Roles' ? Number(roleFilter) : undefined,
      branchId: branchFilter !== 'All Branches' ? Number(branchFilter) : undefined,
      search: searchQuery.trim() !== '' ? searchQuery.trim() : undefined,
    };
  }, [roleFilter, branchFilter, searchQuery]);

  const { data: members = [], isLoading: isLoadingMembers, error: errorMembers } = useMembers(user?.restaurantId, queryFilters);

  const isLoading = isLoadingRoles || isLoadingMembers || isLoadingBranches;
  const error = errorRoles || errorMembers || errorBranches ? 'Failed to load team and access management data.' : null;

  // React Query mutations
  const createRoleMutation = useCreateRole();
  const togglePermissionMutation = useToggleRolePermission();
  const inviteMemberMutation = useInviteMember(user?.restaurantId);
  const updateMemberMutation = useUpdateMember(user?.restaurantId);
  const deleteMemberMutation = useDeleteMember(user?.restaurantId);
  const updateMemberBranchesMutation = useUpdateMemberBranches(user?.restaurantId);

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    branchIds: [] as number[],
  });

  // Custom Role Builder Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({
    displayName: '',
    description: '',
    permissionIds: [] as number[],
  });

  // Member Branch Edit Modal State
  const [editingBranchesMember, setEditingBranchesMember] = useState<MemberResponse | null>(null);
  const [isUpdatingBranches, setIsUpdatingBranches] = useState(false);
  const [editBranchIds, setEditBranchIds] = useState<number[]>([]);

  // Member Role/Status Edit Modal State
  const [editingMemberDetails, setEditingMemberDetails] = useState<MemberResponse | null>(null);
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [editDetailsForm, setEditDetailsForm] = useState({
    role: '',
    status: '',
  });

  // Pre-select default role in form once roles load
  useEffect(() => {
    if (roles.length > 0 && !inviteForm.role) {
      setInviteForm(prev => ({ ...prev, role: roles[0].name }));
    }
  }, [roles, inviteForm.role]);

  // Aggregate all unique permissions from returned roles
  const allSystemPermissions = useMemo(() => {
    const acc: { id: number; resource: string; action: string }[] = [];
    roles.forEach((r) => {
      r.permissions.forEach((res) => {
        res.actions.forEach((act) => {
          if (!acc.some((a) => a.id === act.id)) {
            acc.push({
              id: act.id,
              resource: res.resource,
              action: act.action,
            });
          }
        });
      });
    });
    return acc;
  }, [roles]);

  // Group system permissions by resource name
  const groupedSystemPermissions = useMemo(() => {
    const map: Record<string, { id: number; action: string }[]> = {};
    allSystemPermissions.forEach((p) => {
      if (!map[p.resource]) map[p.resource] = [];
      map[p.resource].push({ id: p.id, action: p.action });
    });
    return map;
  }, [allSystemPermissions]);

  // Handle permission toggle checkboxes
  const handleTogglePermission = async (roleId: number, permissionId: number, currentEnabled: boolean) => {
    try {
      await togglePermissionMutation.mutateAsync({
        roleId,
        permissionId,
        enabled: !currentEnabled,
      });
      addActivityLog('Access Control', `Updated permission ID: ${permissionId} on role: ${roleId}`, 'status');
    } catch (err: any) {
      alert(err.message || 'Failed to update permission setting.');
    }
  };

  // Invite member submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId) return;
    setIsCreatingMember(true);
    setInviteError(null);
    try {
      const selectedRole = inviteForm.role || (roles.length > 0 ? roles[0].name : 'staff');
      await inviteMemberMutation.mutateAsync({
        ...inviteForm,
        role: selectedRole
      });
      
      setShowInviteModal(false);
      // Reset form
      setInviteForm({
        name: '',
        email: '',
        phoneNumber: '',
        role: roles.length > 0 ? roles[0].name : 'staff',
        branchIds: [],
      });
      addActivityLog('Team Management', `Invited new member ${inviteForm.name}`, 'update', `Role: ${selectedRole}`);
    } catch (err: any) {
      setInviteError(err.response?.data?.message || err.message || 'Failed to invite team member.');
    } finally {
      setIsCreatingMember(false);
    }
  };

  // Custom role creation submission
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingRole(true);
    setRoleError(null);
    try {
      await createRoleMutation.mutateAsync(roleForm);
      setShowRoleModal(false);
      setRoleForm({
        displayName: '',
        description: '',
        permissionIds: [],
      });
      addActivityLog('Access Control', `Created custom role: ${roleForm.displayName}`, 'update');
    } catch (err: any) {
      setRoleError(err.response?.data?.message || err.message || 'Failed to create role.');
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Delete team member
  const handleDeleteMember = async (memberId: number, memberName: string) => {
    if (!confirm(`Are you sure you want to revoke access/remove ${memberName}?`)) return;
    try {
      await deleteMemberMutation.mutateAsync(memberId);
      addActivityLog('Team Management', `Removed team member: ${memberName}`, 'alert');
    } catch (err: any) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  // Save member branch assignments
  const handleSaveMemberBranches = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId || !editingBranchesMember) return;
    setIsUpdatingBranches(true);
    try {
      await updateMemberBranchesMutation.mutateAsync({
        memberId: editingBranchesMember.id,
        branchIds: editBranchIds
      });
      setEditingBranchesMember(null);
      addActivityLog('Team Management', `Updated branch assignments for ${editingBranchesMember.name}`, 'update');
    } catch (err: any) {
      alert(err.message || 'Failed to update branch assignments.');
    } finally {
      setIsUpdatingBranches(false);
    }
  };

  // Save member role & status updates
  const handleSaveMemberDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId || !editingMemberDetails) return;
    setIsUpdatingDetails(true);
    try {
      await updateMemberMutation.mutateAsync({
        memberId: editingMemberDetails.id,
        data: editDetailsForm
      });
      setEditingMemberDetails(null);
      addActivityLog('Team Management', `Updated role/status details for ${editingMemberDetails.name}`, 'update');
    } catch (err: any) {
      alert(err.message || 'Failed to update team member details.');
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  // Filtered directory is now populated directly by backend query results
  const filteredDirectory = members;

  // Helper to resolve role display label
  const getRoleDisplayName = (roleName: string) => {
    const found = roles.find(r => r.name === roleName);
    if (found) return found.displayName;
    
    // Fallback pretty prints
    if (roleName === 'owner') return 'Restaurant Owner';
    if (roleName === 'branch_manager') return 'Branch Manager';
    if (roleName === 'staff') return 'Staff Member';
    return roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Helper to format branch text
  const getMemberBranchesText = (member: MemberResponse) => {
    if (member.role === 'owner') return 'All Branches';
    if (!member.branchIds || member.branchIds.length === 0) return 'No branch assigned';
    
    return member.branchIds
      .map(id => {
        const b = branches.find(item => item.id === id);
        return b ? (b.label || b.name) : `Branch #${id}`;
      })
      .join(', ');
  };

  return (
    <div className="space-y-8">
      {/* Tab Switcher & Title header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-150 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staffing & Permissions</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium">Control staff scope access, branches assignment, and security hierarchy.</p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-150">
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'permissions' ? 'bg-[#b3360c] text-white shadow' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Permissions & Roles
          </button>
          
          <button 
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'directory' ? 'bg-[#b3360c] text-white shadow' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Team Directory
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#b3360c] animate-spin" />
          <p className="text-xs text-gray-400 font-semibold mt-2.5">Fetching access hierarchies...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-[#b3360c] border border-red-100 p-5 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#b3360c]" />
          <p className="text-xs font-semibold">{error}</p>
        </div>
      ) : (
        /* RENDER ACTIVE TAB */
        activeTab === 'permissions' ? (
          /* PERMISSIONS & ROLES VIEW */
          <div className="space-y-10">
            {/* Header Controls */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="text-xs text-gray-400 font-mono uppercase font-bold">
                Roles & Access Control list ({roles.length})
              </div>

              <button 
                onClick={() => {
                  setRoleError(null);
                  setShowRoleModal(true);
                }}
                className="bg-[#b3360c] hover:bg-[#942a08] text-white font-bold text-xs px-5 py-3.5 rounded-xl shadow transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Shield className="w-4 h-4" />
                <span>Create Custom Role</span>
              </button>
            </div>

            {/* Dynamic cards for Roles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {roles.map((role) => {
                const isOwner = role.name === 'owner';
                const assignedCount = members.filter(m => m.role === role.name).length;

                return (
                  <div 
                    key={role.id}
                    className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className={`px-5 py-3 flex items-center justify-between border-b ${
                        isOwner 
                          ? 'bg-[#b3360c] text-white border-red-900' 
                          : 'bg-slate-50 text-slate-800 border-gray-150'
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-widest font-mono">
                          {isOwner ? 'SYSTEM DEFAULT' : 'CUSTOMIZABLE'}
                        </span>
                        {isOwner ? <Lock className="w-4 h-4 opacity-80" /> : <Edit3 className="w-4 h-4 text-gray-400" />}
                      </div>

                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">{role.displayName}</h3>
                          <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed min-h-[36px]">
                            {role.description || 'No description set for this role.'}
                          </p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Permissions checkbox lists */}
                        <div className="space-y-4">
                          <span className="text-[10px] font-black font-mono tracking-wider text-gray-400 uppercase block">ACTIVE PERMISSIONS</span>
                          
                          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                            {role.permissions.map((res) => (
                              <div key={res.resource} className="space-y-2">
                                <div className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider">
                                  {res.resource}
                                </div>
                                <div className="space-y-1.5 pl-1.5">
                                  {res.actions.map((act) => {
                                    const checked = act.enabled;
                                    return (
                                      <div 
                                        key={act.id}
                                        onClick={() => !isOwner && handleTogglePermission(role.id, act.id, checked)}
                                        className={`flex items-center gap-2.5 text-xs font-bold transition ${
                                          isOwner 
                                            ? 'text-gray-500 cursor-not-allowed' 
                                            : 'text-gray-800 cursor-pointer hover:text-gray-950'
                                        }`}
                                      >
                                        {checked ? (
                                          <CheckSquare className={`w-4.5 h-4.5 ${isOwner ? 'text-gray-400' : 'text-emerald-600'}`} />
                                        ) : (
                                          <Square className="w-4.5 h-4.5 text-gray-300" />
                                        )}
                                        <span className="capitalize">{act.action}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-semibold font-mono">
                      <span>{assignedCount} {assignedCount === 1 ? 'member' : 'members'} assigned</span>
                      {isOwner && (
                        <span className="text-[9px] uppercase bg-gray-200 text-gray-500 px-2 py-0.5 rounded-sm">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hierarchy Overview */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest font-mono">Permission Hierarchy Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-150 p-6 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <ShieldCheck className="w-6 h-6 text-[#b3360c]" />
                    <h4 className="font-extrabold text-sm text-gray-900 mt-3">Financial Transparency</h4>
                    <p className="text-xs text-gray-400 font-medium mt-1">Determine who can see net revenue, tax distributions, and payouts. Restricted to Owner by default.</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <Sliders className="w-6 h-6 text-emerald-600" />
                    <h4 className="font-extrabold text-sm text-gray-900 mt-3">Multi-Branch Scoping</h4>
                    <p className="text-xs text-gray-400 font-medium mt-1">Control access scoping: allow managers to only see their specific restaurant location data.</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 p-6 rounded-2xl flex flex-col justify-between h-44">
                  <div>
                    <Users className="w-6 h-6 text-blue-600" />
                    <h4 className="font-extrabold text-sm text-gray-900 mt-3">Organization Directory</h4>
                    <p className="text-xs text-gray-400 font-medium mt-1">Manage team members, system roles, active invitations, and active branch overrides directly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner builder */}
            <div className="bg-[#121d21] text-white p-8 rounded-[32px] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <span className="bg-[#c23e11] text-white uppercase text-[9px] tracking-widest font-extrabold px-2.5 py-0.5 rounded-full inline-block">
                  NEW FEATURE
                </span>
                <h3 className="text-xl md:text-2xl font-black">Need more granular control?</h3>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                  Our custom role builder allows you to mix and match over specific permissions to create the perfect workflow for your unique multi-branch operation.
                </p>
              </div>

              <div className="flex gap-3 shrink-0">
                <button 
                  onClick={() => {
                    setRoleError(null);
                    setShowRoleModal(true);
                  }}
                  className="bg-white text-gray-950 font-extrabold text-xs px-6 py-3.5 rounded-xl transition hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  Launch Role Builder
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* TEAM DIRECTORY VIEW */
          <div className="space-y-6">
            
            {/* Header text & Actions */}
            {/* <div className="flex justify-between items-center flex-wrap gap-4 bg-white border border-gray-150 p-6 rounded-2xl shadow-xs">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Active Organization Directory</h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold leading-relaxed">Manage your organization's staff across all active restaurant locations.</p>
              </div>

              <button 
                onClick={() => {
                  setInviteError(null);
                  setShowInviteModal(true);
                }}
                className="bg-[#b3360c] hover:bg-[#942a08] text-white font-bold text-xs px-5 py-3.5 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Member</span>
              </button>
            </div> */}

            {/* Search filter bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="md:col-span-6 bg-white border border-gray-150 rounded-xl px-3 flex items-center shadow-xs">
                <Search className="text-gray-400 w-4 h-4 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs py-3.5 outline-none font-medium placeholder-gray-400"
                />
              </div>

              {/* Role filter */}
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="md:col-span-3 bg-white border border-gray-150 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-700 outline-none cursor-pointer shadow-xs"
              >
                <option value="All Roles">All Roles</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id.toString()}>{r.displayName}</option>
                ))}
              </select>

              {/* Branch filter */}
              <select 
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="md:col-span-3 bg-white border border-gray-150 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-700 outline-none cursor-pointer shadow-xs"
              >
                <option value="All Branches">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id.toString()}>{b.label || b.name}</option>
                ))}
              </select>
            </div>

            {/* Directory grid (cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredDirectory.map((m) => {
                const isOwner = m.role === 'owner';
                const roleBadge = 
                  isOwner ? 'bg-red-50 text-[#b3360c] border-red-100' :
                  m.role === 'branch_manager' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                  'bg-gray-50 text-gray-600 border-gray-100';

                const statusColor = m.status === 'active' ? 'text-green-600' : 'text-amber-500';

                return (
                  <div 
                    key={m.id}
                    className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-[350px] hover:shadow-md transition duration-200"
                  >
                    <div className="space-y-4">
                      {/* Header: Avatar + role badge */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-150 bg-slate-100 flex items-center justify-center font-black text-sm text-[#b3360c] uppercase">
                          {m.name ? m.name.substring(0, 2) : 'EM'}
                        </div>

                        <span className={`text-[9px] font-black uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${roleBadge}`}>
                          {getRoleDisplayName(m.role)}
                        </span>
                      </div>

                      {/* Basic details */}
                      <div>
                        <h4 className="font-extrabold text-base text-gray-900 line-clamp-1">{m.name}</h4>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5 line-clamp-1 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-300" />
                          <span>{m.email}</span>
                        </p>
                        {m.phone && (
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5 line-clamp-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-300" />
                            <span>{m.phone}</span>
                          </p>
                        )}
                      </div>

                      <hr className="border-gray-100" />

                      {/* Telemetry info */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-1.5 text-gray-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{getMemberBranchesText(m)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                          <span className={`w-2 h-2 rounded-full bg-current ${statusColor}`} />
                          <span className="capitalize">{m.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-50">
                      {/* Edit Branches (Disabled for owners) */}
                      <button 
                        disabled={isOwner}
                        onClick={() => {
                          setEditBranchIds(m.branchIds || []);
                          setEditingBranchesMember(m);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-150 font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition cursor-pointer flex items-center gap-1"
                        title="Manage assigned branch outlets"
                      >
                        <MapPin className="w-3 h-3" />
                        <span>Branches</span>
                      </button>

                      {/* Edit details */}
                      <button 
                        disabled={isOwner}
                        onClick={() => {
                          setEditDetailsForm({
                            role: m.role,
                            status: m.status,
                          });
                          setEditingMemberDetails(m);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-150 font-bold text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition cursor-pointer flex items-center gap-1"
                        title="Edit system status and role"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Delete */}
                      <button 
                        disabled={isOwner}
                        onClick={() => handleDeleteMember(m.id, m.name)}
                        className="bg-red-50 hover:bg-red-100 text-[#b3360c] disabled:opacity-40 disabled:cursor-not-allowed border border-red-100 p-2 rounded-xl transition cursor-pointer flex items-center justify-center ml-auto"
                        title="Revoke member token & permissions"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredDirectory.length === 0 && (
                <div className="col-span-full py-16 bg-white border border-gray-150 rounded-3xl text-center text-gray-400">
                  No organization staff members match your criteria filters.
                </div>
              )}
            </div>

            {/* Pagination placeholder */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4">
              <p className="text-xs text-gray-400 font-semibold font-mono uppercase">
                Showing 1 to {filteredDirectory.length} of {members.length} members
              </p>

              <div className="flex items-center gap-1">
                <button className="p-2 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-500 hover:text-gray-900">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#b3360c] text-white font-bold text-xs flex items-center justify-center">1</button>
                <button className="p-2 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-500 hover:text-gray-900">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )
      )}

      {/* Invite Member Modal Slider */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 border border-gray-100 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-lg text-gray-900">Invite New Staff Member</h3>
              </div>

              {inviteError && (
                <div className="mb-4 bg-red-50 text-[#b3360c] border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold leading-relaxed">{inviteError}</p>
                </div>
              )}

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[#b3360c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Business Email</label>
                  <input 
                    required
                    type="email" 
                    placeholder="name@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[#b3360c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Phone Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 1234567890"
                    value={inviteForm.phoneNumber}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[#b3360c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">System Role</label>
                  <select 
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none cursor-pointer focus:border-[#b3360c]"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch selector multi-select checkboxes (Disabled/Hidden for Owner) */}
                {inviteForm.role !== 'owner' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Branch Permissions</label>
                    <div className="max-h-[120px] overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
                      {branches.map(b => {
                        const checked = inviteForm.branchIds.includes(b.id);
                        return (
                          <div 
                            key={b.id}
                            onClick={() => {
                              setInviteForm(prev => {
                                const exists = prev.branchIds.includes(b.id);
                                const nextIds = exists 
                                  ? prev.branchIds.filter(id => id !== b.id)
                                  : [...prev.branchIds, b.id];
                                return { ...prev, branchIds: nextIds };
                              });
                            }}
                            className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800 hover:text-gray-950 select-none"
                          >
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-[#b3360c]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                            <span>{b.name}</span>
                          </div>
                        );
                      })}
                      {branches.length === 0 && (
                        <p className="text-gray-400 text-[10px] font-semibold">No branches configured.</p>
                      )}
                    </div>
                  </div>
                )}

                {inviteForm.role === 'owner' && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-orange-800 text-[11px] font-semibold">
                    Owners automatically possess access scoping to all current and future branch outlets.
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 font-bold border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreatingMember}
                    className="bg-[#b3360c] hover:bg-[#942a08] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isCreatingMember ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Invite...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Invite Member</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Custom Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 border border-gray-100 shadow-2xl relative my-8"
            >
              <button 
                onClick={() => setShowRoleModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-extrabold text-lg text-gray-900">Create Custom Security Role</h3>
              </div>

              {roleError && (
                <div className="mb-4 bg-red-50 text-[#b3360c] border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold leading-relaxed">{roleError}</p>
                </div>
              )}

              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Role Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Supervisor"
                    value={roleForm.displayName}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[#b3360c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Operational control over assigned menu catalogs..."
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:border-[#b3360c] resize-none"
                  />
                </div>

                {/* Checkbox select initial permission IDs grouped by resource */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Initial Permissions Scope</label>
                  <div className="max-h-[160px] overflow-y-auto space-y-3 border border-gray-100 rounded-xl p-3.5 bg-gray-50 pr-1">
                    {(Object.entries(groupedSystemPermissions) as [string, { id: number; action: string }[]][]).map(([resource, actions]) => (
                      <div key={resource} className="space-y-1.5">
                        <div className="text-[9px] uppercase font-bold text-[#b3360c] font-mono tracking-wider">
                          {resource}
                        </div>
                        <div className="space-y-1.5 pl-1.5">
                          {actions.map(act => {
                            const checked = roleForm.permissionIds.includes(act.id);
                            return (
                              <div
                                key={act.id}
                                onClick={() => {
                                  setRoleForm(prev => {
                                    const exists = prev.permissionIds.includes(act.id);
                                    const nextIds = exists
                                      ? prev.permissionIds.filter(id => id !== act.id)
                                      : [...prev.permissionIds, act.id];
                                    return { ...prev, permissionIds: nextIds };
                                  });
                                }}
                                className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800 hover:text-gray-950 select-none"
                              >
                                {checked ? (
                                  <CheckSquare className="w-4 h-4 text-[#b3360c]" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-300" />
                                )}
                                <span className="capitalize">{act.action}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 font-bold border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreatingRole}
                    className="bg-[#b3360c] hover:bg-[#942a08] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isCreatingRole ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Role...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Register Role</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Branch Edit Modal */}
      <AnimatePresence>
        {editingBranchesMember && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 border border-gray-100 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingBranchesMember(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Manage Outlet Access</h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Select which physical branches {editingBranchesMember.name} can monitor.</p>
              </div>

              <form onSubmit={handleSaveMemberBranches} className="space-y-4">
                <div className="max-h-[160px] overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
                  {branches.map(b => {
                    const checked = editBranchIds.includes(b.id);
                    return (
                      <div 
                        key={b.id}
                        onClick={() => {
                          setEditBranchIds(prev => {
                            const exists = prev.includes(b.id);
                            return exists 
                              ? prev.filter(id => id !== b.id)
                              : [...prev, b.id];
                          });
                        }}
                        className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-800 hover:text-gray-950 select-none py-1"
                      >
                        {checked ? (
                          <CheckSquare className="w-4.5 h-4.5 text-[#b3360c]" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-gray-300" />
                        )}
                        <span>{b.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 font-bold border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setEditingBranchesMember(null)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdatingBranches}
                    className="bg-[#b3360c] hover:bg-[#942a08] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isUpdatingBranches ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Outlets...</span>
                      </>
                    ) : (
                      <span>Save Access Scope</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Details / Status & Role Edit Modal */}
      <AnimatePresence>
        {editingMemberDetails && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 border border-gray-100 shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingMemberDetails(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="font-extrabold text-lg text-gray-900">Edit Team Member Scope</h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Change permissions level and account status for {editingMemberDetails.name}.</p>
              </div>

              <form onSubmit={handleSaveMemberDetails} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">System Role</label>
                  <select 
                    value={editDetailsForm.role}
                    onChange={(e) => setEditDetailsForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none cursor-pointer focus:border-[#b3360c]"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Member Status</label>
                  <select 
                    value={editDetailsForm.status}
                    onChange={(e) => setEditDetailsForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-3 text-xs font-semibold outline-none cursor-pointer focus:border-[#b3360c]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 font-bold border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setEditingMemberDetails(null)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdatingDetails}
                    className="bg-[#b3360c] hover:bg-[#942a08] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-900/10 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isUpdatingDetails ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving changes...</span>
                      </>
                    ) : (
                      <span>Apply Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
