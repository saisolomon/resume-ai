import ReactPDF from "@react-pdf/renderer";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume/types";

const styles = StyleSheet.create({
  page: {
    padding: 36, // 0.5 inch
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.3,
  },
  name: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    textAlign: "center",
    marginBottom: 2,
  },
  contactLine: {
    fontSize: 10,
    textAlign: "center",
    color: "#333",
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    marginTop: 6,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  bold: {
    fontFamily: "Times-Bold",
  },
  italic: {
    fontFamily: "Times-Italic",
  },
  bullet: {
    marginLeft: 12,
    marginTop: 1,
  },
});

function ResumeDocument({ data }: { data: ResumeData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Name */}
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.contactLine}>{data.contactLine1}</Text>
        {data.contactLine2 && (
          <Text style={styles.contactLine}>{data.contactLine2}</Text>
        )}
        <View style={styles.divider} />

        {/* Education */}
        {data.education.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Education</Text>
            <View style={styles.divider} />
            {data.education.map((edu, i) => (
              <View key={i}>
                <View style={styles.row}>
                  <Text>
                    <Text style={styles.bold}>{edu.institution}</Text>
                    {", "}
                    {edu.location}
                  </Text>
                  <Text>{edu.date}</Text>
                </View>
                <Text style={styles.italic}>
                  {edu.gpa ? `${edu.degree}; GPA: ${edu.gpa}` : edu.degree}
                </Text>
                {edu.details?.map((d, j) => (
                  <Text key={j} style={styles.bullet}>
                    {"\u2022"} {d}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Experience Sections */}
        {data.experienceSections.map((section, si) => (
          <View key={si}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <View style={styles.divider} />
            {section.entries.map((entry, ei) => (
              <View key={ei}>
                {entry.roles.map((role, ri) => (
                  <View key={ri}>
                    {ri === 0 && (
                      <View style={styles.row}>
                        <Text>
                          <Text style={styles.bold}>{entry.company}</Text>
                          {entry.companyNote && ` (${entry.companyNote})`}
                          {", "}
                          {entry.location}
                        </Text>
                        <Text>{role.date}</Text>
                      </View>
                    )}
                    <View style={ri === 0 ? undefined : styles.row}>
                      <Text style={styles.italic}>{role.title}</Text>
                      {ri > 0 && <Text>{role.date}</Text>}
                    </View>
                    {role.bullets.map((b, bi) => (
                      <Text key={bi} style={styles.bullet}>
                        {"\u2022"} {b}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        {/* Additional */}
        {data.additionalInfo.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Additional</Text>
            <View style={styles.divider} />
            {data.additionalInfo.map((item, i) => (
              <Text key={i} style={styles.bullet}>
                {"\u2022"} {item}
              </Text>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}

export async function generatePdf(data: ResumeData): Promise<Buffer> {
  const stream = await ReactPDF.renderToStream(<ResumeDocument data={data} />);
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
