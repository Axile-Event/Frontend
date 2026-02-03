"use client"

import React, { useState, useCallback, useRef } from "react"
import {
	X,
	UserPlus,
	Users,
	Ticket,
	ChevronDown,
	ChevronUp,
	Copy,
	Check,
	Loader2,
	Mail,
	User,
	Upload,
	FileSpreadsheet,
	AlertCircle,
	CheckCircle2,
	ArrowLeft,
	ArrowRight,
	Trash2
} from "lucide-react"
import toast from "react-hot-toast"
import api from "@/lib/axios"
import CustomDropdown from "@/components/ui/CustomDropdown"

/**
 * BulkBookForAttendeeModal - A multi-step wizard for organizers to book tickets
 * for multiple attendees at once.
 * 
 * Features:
 * - Step 1: Select number of tickets to book
 * - Step 2: Fill individual attendee forms (collapsible accordion)
 * - Copy from first attendee feature
 * - CSV or Excel import for bulk data entry
 * - Progress indicator
 * - Validation and error handling
 */
export default function BulkBookForAttendeeModal({ isOpen, onClose, event, eventId, onSuccess }) {
	// Steps: 1 = Select quantity, 2 = Fill forms
	const [step, setStep] = useState(1)
	const [ticketCount, setTicketCount] = useState(5)
	const [loading, setLoading] = useState(false)
	const [expandedIndex, setExpandedIndex] = useState(0)
	const fileInputRef = useRef(null)
	
	const isPaidEvent = event?.pricing_type === "paid"
	const categories = event?.ticket_categories || []
	const defaultCategoryName = categories.length > 0 ? categories[0].name : "General Admission"
	
	// Initialize attendees array
	const [attendees, setAttendees] = useState(() => 
		Array.from({ length: 5 }, () => ({
			firstname: '',
			lastname: '',
			email: '',
			category_name: defaultCategoryName,
			isValid: false
		}))
	)
	
	// Generate quantity options (1-100)
	const quantityOptions = [
		{ value: 1, label: '1 Ticket' },
		{ value: 5, label: '5 Tickets' },
		{ value: 10, label: '10 Tickets' },
		{ value: 20, label: '20 Tickets' },
		{ value: 30, label: '30 Tickets' },
		{ value: 50, label: '50 Tickets' },
		{ value: 75, label: '75 Tickets' },
		{ value: 100, label: '100 Tickets' }
	]
	
	// Category options for dropdown
	const categoryOptions = categories.map(cat => ({
		value: cat.name,
		label: isPaidEvent ? `${cat.name} - ₦${cat.price?.toLocaleString() || 0}` : cat.name
	}))
	
	// Update attendee field
	const updateAttendee = useCallback((index, field, value) => {
		setAttendees(prev => {
			const updated = [...prev]
			updated[index] = { ...updated[index], [field]: value }
			// Check if form is valid
			const { firstname, lastname, email } = updated[index]
			updated[index].isValid = !!(firstname?.trim() && lastname?.trim() && email?.trim() && email.includes('@'))
			return updated
		})
	}, [])
	
	// Handle quantity change in step 1
	const handleQuantityChange = (newCount) => {
		setTicketCount(newCount)
		// Resize attendees array
		setAttendees(prev => {
			if (newCount > prev.length) {
				// Add more empty attendees
				return [
					...prev,
					...Array.from({ length: newCount - prev.length }, () => ({
						firstname: '',
						lastname: '',
						email: '',
						category_name: defaultCategoryName,
						isValid: false
					}))
				]
			} else {
				// Trim array
				return prev.slice(0, newCount)
			}
		})
	}
	
	// Copy data from first attendee to all others
	const copyFromFirst = () => {
		if (!attendees[0]?.firstname && !attendees[0]?.lastname) {
			toast.error("Please fill in the first attendee's details first")
			return
		}
		
		setAttendees(prev => {
			const first = prev[0]
			return prev.map((attendee, idx) => {
				if (idx === 0) return attendee
				return {
					...attendee,
					category_name: first.category_name
					// Only copy category, not personal details (they need unique info)
				}
			})
		})
		toast.success("Category copied to all attendees")
	}
	
	// Parse CSV data (strip BOM so header row is detected correctly)
	const parseCSV = (text) => {
		const raw = typeof text === 'string' ? text.replace(/^\uFEFF/, '') : ''
		const lines = raw.trim().split(/\r?\n/)
		const results = []

		const firstLine = lines[0] ?? ''
		const firstLineLower = firstLine.toLowerCase()
		const isHeader =
			firstLineLower.includes('firstname') ||
			firstLineLower.includes('first name') ||
			firstLineLower.includes('lastname') ||
			firstLineLower.includes('last name') ||
			firstLineLower.includes('email')
		const startIdx = isHeader ? 1 : 0

		for (let i = startIdx; i < lines.length; i++) {
			const line = lines[i].trim()
			if (!line) continue

			const parts = line.includes('\t') ? line.split('\t') : line.split(',')
			const firstname = (parts[0] ?? '').trim()
			const lastname = (parts[1] ?? '').trim()
			const email = (parts[2] ?? '').trim()
			const category_name = (parts[3] ?? '').trim() || defaultCategoryName

			if (parts.length >= 3) {
				results.push({
					firstname,
					lastname,
					email,
					category_name,
					isValid: !!(firstname && lastname && email && email.includes('@'))
				})
			}
		}

		return results
	}

	// Parse Excel (.xlsx, .xls) - columns A=firstname, B=lastname, C=email, D=category (optional)
	const parseExcel = (arrayBuffer) => {
		const XLSX = require('xlsx')
		const workbook = XLSX.read(arrayBuffer, { type: 'array' })
		const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
		const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
		if (!rows.length) return []

		const results = []
		const rawHeader = rows[0].map((h) => String(h || '').toLowerCase())
		const hasHeader =
			rawHeader.some((h) => h.includes('first') || h.includes('name')) &&
			rawHeader.some((h) => h.includes('email'))

		const startRow = hasHeader ? 1 : 0
		const getColIdx = () => {
			if (!hasHeader) {
				return { firstname: 0, lastname: 1, email: 2, category: 3 }
			}
			const first = rawHeader.findIndex((h) => /first|given|fname/i.test(h) || h === 'firstname')
			const last = rawHeader.findIndex((h) => /last|surname|lname|family/i.test(h) || h === 'lastname')
			const email = rawHeader.findIndex((h) => h.includes('email') || h === 'e-mail')
			const cat = rawHeader.findIndex((h) => h.includes('category') || h === 'ticket')
			return {
				firstname: first >= 0 ? first : 0,
				lastname: last >= 0 ? last : 1,
				email: email >= 0 ? email : 2,
				category: cat >= 0 ? cat : 3
			}
		}
		const idx = getColIdx()

		for (let i = startRow; i < rows.length; i++) {
			const row = Array.isArray(rows[i]) ? rows[i] : []
			const firstname = String(row[idx.firstname] ?? '').trim()
			const lastname = String(row[idx.lastname] ?? '').trim()
			const email = String(row[idx.email] ?? '').trim()
			const category_name = String(row[idx.category] ?? '').trim() || defaultCategoryName
			if (!firstname || !lastname || !email || !email.includes('@')) continue
			results.push({
				firstname,
				lastname,
				email,
				category_name,
				isValid: true
			})
		}
		return results
	}

	// Handle CSV or Excel file upload
	const handleFileUpload = (e) => {
		const file = e.target.files?.[0]
		if (!file) return

		const fileName = (file.name || '').toLowerCase()
		const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

		if (isExcel) {
			const reader = new FileReader()
			reader.onload = (event) => {
				try {
					const arrayBuffer = event.target?.result
					const parsed = parseExcel(arrayBuffer)
					if (parsed.length === 0) {
						toast.error(
							"No valid data in Excel. Use columns: A=First name, B=Last name, C=Email, D=Category (optional)"
						)
						return
					}
					setAttendees(parsed)
					setTicketCount(parsed.length)
					const invalidCount = parsed.filter((p) => !p.isValid).length
					toast.success(
						invalidCount > 0
							? `Imported ${parsed.length} row(s). ${invalidCount} need(s) completion before booking.`
							: `Imported ${parsed.length} attendee(s) from Excel`
					)
				} catch (err) {
					console.error(err)
					toast.error("Failed to parse Excel file")
				}
			}
			reader.readAsArrayBuffer(file)
		} else {
			const reader = new FileReader()
			reader.onload = (event) => {
				try {
					const text = event.target?.result
					const parsed = parseCSV(text)
					if (parsed.length === 0) {
						toast.error(
							"No valid data found. Use columns: firstname, lastname, email, category (optional)"
						)
						return
					}
					setAttendees(parsed)
					setTicketCount(parsed.length)
					const invalidCount = parsed.filter((p) => !p.isValid).length
					toast.success(
						invalidCount > 0
							? `Imported ${parsed.length} row(s). ${invalidCount} need(s) completion before booking.`
							: `Imported ${parsed.length} attendee(s) from CSV`
					)
				} catch (err) {
					toast.error("Failed to parse CSV file")
				}
			}
			reader.readAsText(file)
		}

		if (fileInputRef.current) fileInputRef.current.value = ''
	}
	
	// Count valid attendees
	const validCount = attendees.filter(a => a.isValid).length
	const progressPercent = ticketCount > 0 ? Math.round((validCount / ticketCount) * 100) : 0
	
	// Handle form submission
	const handleSubmit = async () => {
		// Validate all attendees
		const invalidIndices = attendees
			.map((a, idx) => !a.isValid ? idx + 1 : null)
			.filter(idx => idx !== null)
		
		if (invalidIndices.length > 0) {
			if (invalidIndices.length <= 5) {
				toast.error(`Please complete attendee forms: #${invalidIndices.join(', #')}`)
			} else {
				toast.error(`${invalidIndices.length} attendee forms are incomplete`)
			}
			// Expand first invalid form
			const firstInvalidIdx = attendees.findIndex(a => !a.isValid)
			if (firstInvalidIdx >= 0) setExpandedIndex(firstInvalidIdx)
			return
		}
		
		setLoading(true)
		
		try {
			const decodedEventId = decodeURIComponent(eventId)
			
			const payload = {
				event_id: decodedEventId,
				attendees: attendees.map(a => ({
					firstname: a.firstname.trim(),
					lastname: a.lastname.trim(),
					email: a.email.trim(),
					category_name: a.category_name || defaultCategoryName
				}))
			}
			
			const response = await api.post('/tickets/organizer/bulk-book-for-attendees/', payload)
			const result = response.data
			
			toast.success(`Successfully booked ${result.ticket_count} ticket(s) for ${result.unique_attendees} attendee(s)`)
			
			// Reset and close
			resetModal()
			onSuccess?.()
			onClose()
			
		} catch (error) {
			console.error("Bulk booking error:", error)
			const data = error.response?.data
			let errorMsg = data?.error || data?.detail || "Failed to book tickets"
			if (typeof data === "object" && !data?.error && !data?.detail) {
				const firstKey = Object.keys(data)[0]
				const firstVal = data[firstKey]
				if (Array.isArray(firstVal) && firstVal.length > 0) {
					const first = firstVal[0]
					if (typeof first === "string") errorMsg = first
					else if (typeof first === "object" && first !== null) {
						const fieldKey = Object.keys(first)[0]
						const fieldMsg = first[fieldKey]
						errorMsg = Array.isArray(fieldMsg) ? fieldMsg[0] : String(fieldMsg)
					}
				} else if (typeof firstVal === "string") errorMsg = firstVal
			}
			toast.error(errorMsg || "Failed to book tickets")
		} finally {
			setLoading(false)
		}
	}
	
	// Reset modal state
	const resetModal = () => {
		setStep(1)
		setTicketCount(5)
		setExpandedIndex(0)
		setAttendees(Array.from({ length: 5 }, () => ({
			firstname: '',
			lastname: '',
			email: '',
			category_name: defaultCategoryName,
			isValid: false
		})))
	}
	
	// Handle close
	const handleClose = () => {
		resetModal()
		onClose()
	}
	
	if (!isOpen) return null
	
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/90 backdrop-blur-md"
				onClick={handleClose}
			/>
			
			{/* Modal */}
			<div className="relative bg-linear-to-b from-[#111111] to-[#0A0A0A] border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
				{/* Header */}
				<div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 shrink-0">
					<div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-green-500 to-teal-500" />
					
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 sm:gap-3">
							<div className="p-2 sm:p-2.5 bg-linear-to-br from-emerald-500/20 to-green-500/20 rounded-lg sm:rounded-xl border border-emerald-500/20">
								<Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
							</div>
							<div>
								<h2 className="text-base sm:text-lg font-bold text-white">Bulk Book Tickets</h2>
								<p className="text-[10px] sm:text-[11px] text-gray-500">
									{step === 1 ? 'Select number of tickets' : `Fill details for ${ticketCount} attendee(s)`}
								</p>
							</div>
						</div>
						<button
							onClick={handleClose}
							className="p-1.5 sm:p-2 hover:bg-white/5 rounded-lg sm:rounded-xl transition-colors group"
						>
							<X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-white transition-colors" />
						</button>
					</div>
					
					{/* Step indicator */}
					<div className="flex items-center gap-2 mt-4">
						<div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />
						<div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-white/10'}`} />
					</div>
				</div>
				
				{/* Content */}
				<div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
					{/* Step 1: Select Quantity */}
					{step === 1 && (
						<div className="space-y-6 py-4">
							<div className="text-center space-y-2">
								<div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
									<Ticket className="w-8 h-8 text-emerald-400" />
								</div>
								<h3 className="text-lg font-bold text-white">How many tickets?</h3>
								<p className="text-sm text-gray-500">
									Select the number of tickets you want to book for attendees
								</p>
							</div>
							
							<div className="grid grid-cols-4 gap-2 sm:gap-3">
								{quantityOptions.map(opt => (
									<button
										key={opt.value}
										onClick={() => handleQuantityChange(opt.value)}
										className={`py-3 sm:py-4 rounded-xl border font-bold text-sm transition-all ${
											ticketCount === opt.value
												? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
												: 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
										}`}
									>
										{opt.value}
									</button>
								))}
							</div>
							
							<div className="flex items-center gap-3">
								<div className="flex-1 h-px bg-white/10" />
								<span className="text-xs text-gray-600">or enter custom</span>
								<div className="flex-1 h-px bg-white/10" />
							</div>
							
							<div className="flex items-center justify-center gap-3">
								<input
									type="number"
									min="1"
									max="500"
									value={ticketCount}
									onChange={(e) => handleQuantityChange(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
									className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg font-bold focus:outline-none focus:border-emerald-500/50"
								/>
								<span className="text-gray-500">tickets</span>
							</div>
							
							{/* CSV or Excel Import */}
							<div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
								<div className="flex items-center gap-2 text-sm font-medium text-gray-400">
									<FileSpreadsheet className="w-4 h-4" />
									Import from CSV or Excel
								</div>
								<div className="text-xs text-gray-600 space-y-2">
									<p className="font-medium text-gray-500">Required columns (row 1 = header):</p>
									<table className="w-full text-[11px] border border-white/10 rounded overflow-hidden">
										<thead>
											<tr className="bg-white/5">
												<th className="text-left py-1.5 px-2 font-semibold">Column</th>
												<th className="text-left py-1.5 px-2 font-semibold">Content</th>
												<th className="text-left py-1.5 px-2 font-semibold">Required</th>
											</tr>
										</thead>
										<tbody className="text-gray-400">
											<tr><td className="py-1 px-2">A (or header: First name / firstname)</td><td className="py-1 px-2">First name</td><td className="py-1 px-2">Yes</td></tr>
											<tr><td className="py-1 px-2">B (or header: Last name / lastname)</td><td className="py-1 px-2">Last name</td><td className="py-1 px-2">Yes</td></tr>
											<tr><td className="py-1 px-2">C (or header: Email / email)</td><td className="py-1 px-2">Email address</td><td className="py-1 px-2">Yes</td></tr>
											<tr><td className="py-1 px-2">D (or header: Category / ticket)</td><td className="py-1 px-2">Ticket category name</td><td className="py-1 px-2">Optional</td></tr>
										</tbody>
									</table>
									<p>Row 1 can be a header row (e.g. First name, Last name, Email, Category). Data starts from row 2. CSV: same order, comma or tab separated.</p>
								</div>
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv,.txt,.xlsx,.xls"
									onChange={handleFileUpload}
									className="hidden"
								/>
								<button
									onClick={() => fileInputRef.current?.click()}
									className="w-full py-2.5 rounded-lg border border-dashed border-white/20 text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
								>
									<Upload className="w-4 h-4" />
									Choose CSV or Excel File
								</button>
							</div>
						</div>
					)}
					
					{/* Step 2: Fill Forms */}
					{step === 2 && (
						<div className="space-y-4 py-2">
							{/* Progress bar */}
							<div className="sticky top-0 bg-[#111111] py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 z-10 border-b border-white/5">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-medium text-gray-400">
										{validCount} of {ticketCount} completed
									</span>
									<span className="text-xs font-bold text-emerald-400">{progressPercent}%</span>
								</div>
								<div className="h-2 bg-white/10 rounded-full overflow-hidden">
									<div 
										className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
										style={{ width: `${progressPercent}%` }}
									/>
								</div>
								
								{/* Quick actions */}
								<div className="flex items-center gap-2 mt-3">
									{isPaidEvent && categories.length > 1 && (
										<button
											onClick={copyFromFirst}
											className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
										>
											<Copy className="w-3 h-3" />
											Copy category to all
										</button>
									)}
								</div>
							</div>
							
							{/* Attendee forms */}
							<div className="space-y-2">
								{attendees.map((attendee, idx) => (
									<AttendeeForm
										key={idx}
										index={idx}
										attendee={attendee}
										isExpanded={expandedIndex === idx}
										onToggle={() => setExpandedIndex(expandedIndex === idx ? -1 : idx)}
										onUpdate={(field, value) => updateAttendee(idx, field, value)}
										categories={categoryOptions}
										isPaidEvent={isPaidEvent}
									/>
								))}
							</div>
						</div>
					)}
				</div>
				
				{/* Footer */}
				<div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/5 bg-[#0A0A0A]">
					<div className="flex items-center gap-3">
						{step === 2 && (
							<button
								onClick={() => setStep(1)}
								className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-medium text-sm transition-colors flex items-center gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back
							</button>
						)}
						
						<button
							onClick={step === 1 ? () => setStep(2) : handleSubmit}
							disabled={loading || (step === 2 && validCount === 0)}
							className="flex-1 py-3 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white text-sm sm:text-base font-bold transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
									<span>Processing {ticketCount} tickets...</span>
								</>
							) : step === 1 ? (
								<>
									<span>Continue with {ticketCount} tickets</span>
									<ArrowRight className="w-4 h-4" />
								</>
							) : (
								<>
									<Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
									<span>Book {ticketCount} Ticket{ticketCount > 1 ? 's' : ''}</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

/**
 * Individual attendee form component (collapsible)
 */
function AttendeeForm({ index, attendee, isExpanded, onToggle, onUpdate, categories, isPaidEvent }) {
	return (
		<div className={`border rounded-xl overflow-visible transition-all ${
			attendee.isValid 
				? 'border-emerald-500/30 bg-emerald-500/5' 
				: 'border-white/10 bg-white/2'
		}`}>
			{/* Header - Always visible */}
			<button
				onClick={onToggle}
				className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
			>
				<div className="flex items-center gap-3">
					<div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
						attendee.isValid 
							? 'bg-emerald-500 text-white' 
							: 'bg-white/10 text-gray-500'
					}`}>
						{attendee.isValid ? <Check className="w-3.5 h-3.5" /> : index + 1}
					</div>
					<div className="text-left">
						<div className="text-sm font-medium text-white">
							{attendee.firstname && attendee.lastname 
								? `${attendee.firstname} ${attendee.lastname}` 
								: `Attendee #${index + 1}`
							}
						</div>
						{attendee.email && (
							<div className="text-[10px] text-gray-500">{attendee.email}</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{attendee.isValid && (
						<CheckCircle2 className="w-4 h-4 text-emerald-500" />
					)}
					{isExpanded ? (
						<ChevronUp className="w-4 h-4 text-gray-500" />
					) : (
						<ChevronDown className="w-4 h-4 text-gray-500" />
					)}
				</div>
			</button>
			
			{/* Expanded form */}
			{isExpanded && (
				<div className="px-4 pb-4 space-y-3 border-t border-white/5">
					<div className="pt-3 grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">
								First Name
							</label>
							<input
								type="text"
								value={attendee.firstname}
								onChange={(e) => onUpdate('firstname', e.target.value)}
								placeholder="John"
								className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">
								Last Name
							</label>
							<input
								type="text"
								value={attendee.lastname}
								onChange={(e) => onUpdate('lastname', e.target.value)}
								placeholder="Doe"
								className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
							/>
						</div>
					</div>
					
					<div className="space-y-1">
						<label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">
							Email Address
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
							<input
								type="email"
								value={attendee.email}
								onChange={(e) => onUpdate('email', e.target.value)}
								placeholder="attendee@example.com"
								className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
							/>
						</div>
					</div>
					
					{/* Category selection - show when event has categories (paid or free) */}
					{categories.length > 0 && (
						<div className="relative z-[100]">
							<CustomDropdown
								label="Ticket Category"
								value={attendee.category_name}
								onChange={(value) => onUpdate('category_name', value)}
								options={categories}
								placeholder="Select a category"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
