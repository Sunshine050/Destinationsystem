// app/1669/dashboard/components/CaseModal.tsx
// Modal for case details
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { EmergencyCase } from "@/shared/types";

interface CaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCase: EmergencyCase | null;
}

export const CaseModal: React.FC<CaseModalProps> = ({ open, onOpenChange, selectedCase }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>รายละเอียดเคส #{selectedCase?.id}</DialogTitle>
        <div className="mt-2 space-y-4">
          {selectedCase && (
            <div className="space-y-4">
              <div>
                <strong>ประเภทฉุกเฉิน:</strong> {selectedCase.emergencyType}
              </div>
              <div>
                <strong>คำอธิบายเต็ม:</strong> {selectedCase.descriptionFull}
              </div>
              <div>
                <strong>ระดับความรุนแรง:</strong> {selectedCase.grade}
              </div>
              <div>
                <strong>สถานะ:</strong> {selectedCase.status}
              </div>
              <div>
                <strong>ชื่อผู้ป่วย:</strong> {selectedCase.patientName}
              </div>
              <div>
                <strong>เบอร์ติดต่อ:</strong> {selectedCase.contactNumber}
              </div>
              <div>
                <strong>สถานที่:</strong> {selectedCase.location.address} (Lat: {selectedCase.location.coordinates.lat}, Lng: {selectedCase.location.coordinates.lng})
              </div>
              {selectedCase.assignedTo && (
                <div>
                  <strong>มอบหมายให้:</strong> {selectedCase.assignedTo}
                </div>
              )}
              <div>
                <strong>อาการ:</strong>
                <ul className="list-disc pl-5">
                  {selectedCase.symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)}
                </ul>
              </div>
              <div>
                <strong>รายงานเมื่อ:</strong> {new Date(selectedCase.reportedAt).toLocaleString("th-TH")}
              </div>
            </div>
          )}
        </div>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);