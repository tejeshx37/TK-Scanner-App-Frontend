import { AlertTriangle, ArrowLeft, CheckCircle2, Send, XCircle } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ScanResponse } from '../types';

interface ScanResultProps {
    result: ScanResponse;
    onReset: () => void;
    onConfirm: () => void;
    onConfirmMember?: (memberId: string) => void;
    isConfirming: boolean;
}

export default function ScanResult({ result, onReset, onConfirm, onConfirmMember, isConfirming }: ScanResultProps) {
    const { status, student, error } = result;

    const renderContent = () => {
        switch (status) {
            case 'valid':
                return (
                    <View className="space-y-6">
                        <View className="items-center">
                            <View className="w-16 h-16 bg-green-900/50 rounded-full items-center justify-center mb-4">
                                <CheckCircle2 size={40} color="#22c55e" />
                            </View>
                            <Text className="text-2xl font-bold text-white mb-1">Valid Ticket</Text>
                            <Text className="text-green-400 font-medium">Ready for Check-in</Text>
                        </View>

                        <View className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 space-y-3">
                            <View className="flex-row justify-between border-b border-zinc-700 pb-2 mb-2">
                                <Text className="text-zinc-400">Name</Text>
                                <Text className="text-white font-semibold">{student?.name}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-zinc-700 pb-2 mb-2">
                                <Text className="text-zinc-400">Pass Type</Text>
                                <Text className="text-blue-400 font-semibold">{student?.passType}</Text>
                            </View>
                        </View>

                        {student?.members && student.members.length > 0 ? (
                            <View className="space-y-3">
                                <Text className="text-zinc-400 font-medium px-1">Team Members</Text>
                                {student.members.map((member) => (
                                    <View key={member.memberId} className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 flex-row justify-between items-center">
                                        <View className="flex-1">
                                            <Text className="text-white font-semibold">{member.name}</Text>
                                            <Text className="text-zinc-500 text-xs">{member.isLeader ? 'Leader' : 'Member'} • {member.phone}</Text>
                                        </View>

                                        {member.checkedIn ? (
                                            <View className="bg-green-900/30 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                                                <CheckCircle2 size={14} color="#22c55e" />
                                                <Text className="text-green-500 text-xs font-bold uppercase">In</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => onConfirmMember?.(member.memberId)}
                                                disabled={isConfirming}
                                                className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center gap-1.5"
                                            >
                                                {isConfirming ? (
                                                    <ActivityIndicator size="small" color="white" />
                                                ) : (
                                                    <>
                                                        <Send size={14} color="white" />
                                                        <Text className="text-white text-xs font-bold uppercase">Verify</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                                <View className="flex-row justify-between">
                                    <Text className="text-zinc-400">Amount Paid</Text>
                                    <Text className="text-green-400 font-mono">₹{student?.amountPaid}</Text>
                                </View>
                            </View>
                        )}

                        <View className="flex-row gap-4 pt-4">
                            <TouchableOpacity
                                onPress={onReset}
                                disabled={isConfirming}
                                className="flex-1 py-3 px-4 bg-zinc-700 rounded-lg flex-row items-center justify-center gap-2"
                            >
                                <ArrowLeft size={20} color="white" />
                                <Text className="text-white font-semibold">{student?.members ? 'Scan Next' : 'Cancel'}</Text>
                            </TouchableOpacity>

                            {!student?.members && (
                                <TouchableOpacity
                                    onPress={onConfirm}
                                    disabled={isConfirming}
                                    className="flex-1 py-3 px-4 bg-green-600 rounded-lg flex-row items-center justify-center gap-2"
                                >
                                    {isConfirming ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <>
                                            <Send size={20} color="white" />
                                            <Text className="text-white font-semibold">Check In</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                );

            case 'duplicate':
                return (
                    <View className="space-y-6">
                        <View className="items-center">
                            <View className="w-16 h-16 bg-yellow-900/50 rounded-full items-center justify-center mb-4">
                                <AlertTriangle size={40} color="#eab308" />
                            </View>
                            <Text className="text-2xl font-bold text-white mb-1">Already Scanned</Text>
                            <Text className="text-yellow-400 font-medium">Duplicate Entry Attempt</Text>
                        </View>

                        <View className="bg-zinc-800 rounded-xl p-4 border border-yellow-900/50 space-y-3">
                            <View className="flex-row justify-between border-b border-zinc-700 pb-2 mb-2">
                                <Text className="text-zinc-400">Name</Text>
                                <Text className="text-white font-semibold">{student?.name}</Text>
                            </View>
                            <View className="flex-row justify-between border-b border-zinc-700 pb-2 mb-2">
                                <Text className="text-zinc-400">Scanned At</Text>
                                <Text className="text-yellow-200 font-mono">
                                    {student?.firstCheckInTime ? new Date(student.firstCheckInTime).toLocaleTimeString() : 'Unknown'}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-zinc-400">Pass Type</Text>
                                <Text className="text-blue-400 font-semibold">{student?.passType}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={onReset}
                            className="w-full py-3 px-4 bg-zinc-700 rounded-lg flex-row items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} color="white" />
                            <Text className="text-white font-semibold">Scan Next</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'invalid':
            default:
                return (
                    <View className="space-y-6">
                        <View className="items-center">
                            <View className="w-16 h-16 bg-red-900/50 rounded-full items-center justify-center mb-4">
                                <XCircle size={40} color="#ef4444" />
                            </View>
                            <Text className="text-2xl font-bold text-white mb-1">Invalid Ticket</Text>
                            <Text className="text-red-400 font-medium text-center">{error || 'Unknown error occurred'}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={onReset}
                            className="w-full py-3 px-4 bg-zinc-700 rounded-lg flex-row items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} color="white" />
                            <Text className="text-white font-semibold">Try Again</Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <View className="absolute inset-0 z-50 justify-end">
            {/* Backdrop */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={onReset}
                className="absolute inset-0 bg-black/80"
            />

            {/* Content Card */}
            <View className="bg-zinc-900 w-full rounded-t-2xl border-t border-zinc-800 p-6 pb-12 shadow-2xl">
                <View className="w-12 h-1 bg-zinc-700 rounded-full self-center mb-6" />
                {renderContent()}
            </View>
        </View>
    );
}
