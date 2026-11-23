using System.Globalization;
using System.IO.Compression;
using System.Security;
using System.Text;
using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Entities;

namespace Aeromanager.Infrastructure.Services;

public class ExcelReportService : IExcelReportService
{
    private sealed record ColumnSpec(string Header, double CharWidth);
    private sealed record CellSpec(string Value, int StyleIndex, bool IsNumber = false);

    private const int StyleTitle = 1;
    private const int StyleSubtitle = 2;
    private const int StyleHeader = 3;
    private const int StyleCellEven = 4;
    private const int StyleCellOdd = 5;
    private const int StyleCellEvenCenter = 6;
    private const int StyleCellOddCenter = 7;
    private const int StyleCurrencyEven = 8;
    private const int StyleCurrencyOdd = 9;
    private const int StyleBadgeInfo = 10;
    private const int StyleBadgeWarn = 11;
    private const int StyleBadgeOk = 12;
    private const int StyleBadgeDanger = 13;

    public byte[] GenerarReporteVuelosExcel(IEnumerable<Vuelo> vuelos)
    {
        var list = vuelos.ToList();
        var columns = new[]
        {
            new ColumnSpec("ID", 8),
            new ColumnSpec("N° Vuelo", 14),
            new ColumnSpec("Ruta ID", 11),
            new ColumnSpec("Avión ID", 11),
            new ColumnSpec("Gate ID", 11),
            new ColumnSpec("Fecha Salida", 20),
            new ColumnSpec("Fecha Llegada", 20),
            new ColumnSpec("Capacidad (PAX)", 18),
            new ColumnSpec("Tarifa Base (USD)", 19),
            new ColumnSpec("Estado", 18),
            new ColumnSpec("Activo", 10)
        };

        var rows = list.Select((v, idx) =>
        {
            var centerStyle = idx % 2 == 0 ? StyleCellEvenCenter : StyleCellOddCenter;
            var currencyStyle = idx % 2 == 0 ? StyleCurrencyEven : StyleCurrencyOdd;
            return new[]
            {
                new CellSpec(v.Id.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(v.NumeroVuelo ?? string.Empty, centerStyle),
                new CellSpec(v.RutaId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(v.AvionId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(v.PuertaEmbarqueId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(v.FechaHoraSalida.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture), centerStyle),
                new CellSpec(v.FechaHoraLlegada.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture), centerStyle),
                new CellSpec(v.CapacidadVuelo.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(v.PrecioBase.ToString("0.00", CultureInfo.InvariantCulture), currencyStyle, true),
                new CellSpec(v.Estado ?? string.Empty, ResolveStatusStyle(v.Estado ?? string.Empty)),
                new CellSpec(v.Activo ? "Sí" : "No", v.Activo ? StyleBadgeOk : StyleBadgeDanger)
            };
        });

        return BuildXlsx(
            "Reporte_Vuelos",
            "AeroManager — Reporte Oficial de Programación de Vuelos",
            $"Generado: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC · Total de registros: {list.Count}",
            columns,
            rows);
    }

    public byte[] GenerarReporteReservasExcel(IEnumerable<Reserva> reservas)
    {
        var list = reservas.ToList();
        var columns = new[]
        {
            new ColumnSpec("ID", 8),
            new ColumnSpec("Código Ticket", 20),
            new ColumnSpec("Vuelo ID", 12),
            new ColumnSpec("Usuario ID", 13),
            new ColumnSpec("Fecha Reserva", 20),
            new ColumnSpec("Monto Total (USD)", 20),
            new ColumnSpec("Estado Reserva", 18),
            new ColumnSpec("Activo", 10)
        };

        var rows = list.Select((r, idx) =>
        {
            var centerStyle = idx % 2 == 0 ? StyleCellEvenCenter : StyleCellOddCenter;
            var currencyStyle = idx % 2 == 0 ? StyleCurrencyEven : StyleCurrencyOdd;
            return new[]
            {
                new CellSpec(r.Id.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(r.CodigoTicket ?? string.Empty, centerStyle),
                new CellSpec(r.VueloId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(r.UsuarioRegistroId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(r.FechaReserva.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture), centerStyle),
                new CellSpec(r.MontoTotal.ToString("0.00", CultureInfo.InvariantCulture), currencyStyle, true),
                new CellSpec(r.EstadoReserva ?? string.Empty, ResolveStatusStyle(r.EstadoReserva ?? string.Empty)),
                new CellSpec(r.Activo ? "Sí" : "No", r.Activo ? StyleBadgeOk : StyleBadgeDanger)
            };
        });

        return BuildXlsx(
            "Reporte_Reservas",
            "AeroManager — Reporte Oficial de Reservas y Facturación",
            $"Generado: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC · Total de registros: {list.Count}",
            columns,
            rows);
    }

    public byte[] GenerarReportePasajerosExcel(IEnumerable<Pasajero> pasajeros)
    {
        var list = pasajeros.ToList();
        var columns = new[]
        {
            new ColumnSpec("ID", 8),
            new ColumnSpec("Nombres", 24),
            new ColumnSpec("Apellidos", 24),
            new ColumnSpec("Tipo Doc ID", 13),
            new ColumnSpec("N° Documento", 18),
            new ColumnSpec("Correo Electrónico", 32),
            new ColumnSpec("Teléfono", 18),
            new ColumnSpec("País ID", 11),
            new ColumnSpec("Activo", 10)
        };

        var rows = list.Select((p, idx) =>
        {
            var baseStyle = idx % 2 == 0 ? StyleCellEven : StyleCellOdd;
            var centerStyle = idx % 2 == 0 ? StyleCellEvenCenter : StyleCellOddCenter;
            return new[]
            {
                new CellSpec(p.Id.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(p.Nombres ?? string.Empty, baseStyle),
                new CellSpec(p.Apellidos ?? string.Empty, baseStyle),
                new CellSpec(p.TipoDocumentoId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(p.NumeroDocumento ?? string.Empty, centerStyle),
                new CellSpec(p.Email ?? string.Empty, baseStyle),
                new CellSpec(p.Telefono ?? string.Empty, centerStyle),
                new CellSpec(p.NacionalidadPaisId.ToString(CultureInfo.InvariantCulture), centerStyle, true),
                new CellSpec(p.Activo ? "Sí" : "No", p.Activo ? StyleBadgeOk : StyleBadgeDanger)
            };
        });

        return BuildXlsx(
            "Reporte_Pasajeros",
            "AeroManager — Padrón Oficial de Pasajeros",
            $"Generado: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC · Total de registros: {list.Count}",
            columns,
            rows);
    }

    private static int ResolveStatusStyle(string status)
    {
        var upper = status.ToUpperInvariant();
        if (upper.Contains("ABORD") || upper.Contains("PEND") || upper.Contains("RETRAS"))
            return StyleBadgeWarn;
        if (upper.Contains("CONFIRM") || upper.Contains("VUELO") || upper.Contains("ATERRIZ"))
            return StyleBadgeOk;
        if (upper.Contains("CANCEL"))
            return StyleBadgeDanger;
        return StyleBadgeInfo;
    }

    private static byte[] BuildXlsx(
        string sheetName,
        string title,
        string subtitle,
        ColumnSpec[] columns,
        IEnumerable<CellSpec[]> rows)
    {
        using var ms = new MemoryStream();
        using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, true))
        {
            WriteEntry(archive, "[Content_Types].xml", BuildContentTypesXml());
            WriteEntry(archive, "_rels/.rels", BuildRootRelsXml());
            WriteEntry(archive, "xl/workbook.xml", BuildWorkbookXml(sheetName));
            WriteEntry(archive, "xl/_rels/workbook.xml.rels", BuildWorkbookRelsXml());
            WriteEntry(archive, "xl/styles.xml", BuildStylesXml());
            WriteEntry(archive, "xl/worksheets/sheet1.xml", BuildSheetXml(title, subtitle, columns, rows));
        }

        return ms.ToArray();
    }

    private static void WriteEntry(ZipArchive archive, string entryPath, string content)
    {
        var entry = archive.CreateEntry(entryPath, CompressionLevel.Optimal);
        using var writer = new StreamWriter(entry.Open(), new UTF8Encoding(false));
        writer.Write(content);
    }

    private static string BuildContentTypesXml() =>
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
          <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
          <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
        </Types>
        """;

    private static string BuildRootRelsXml() =>
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
        </Relationships>
        """;

    private static string BuildWorkbookXml(string sheetName) =>
        $"""
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
          <sheets>
            <sheet name="{EscapeXml(sheetName)}" sheetId="1" r:id="rId1"/>
          </sheets>
        </workbook>
        """;

    private static string BuildWorkbookRelsXml() =>
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
        </Relationships>
        """;

    private static string BuildStylesXml() =>
        """
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
          <numFmts count="1">
            <numFmt numFmtId="164" formatCode="$#,##0.00"/>
          </numFmts>
          <fonts count="9">
            <font><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
            <font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
            <font><sz val="9"/><color rgb="FF334155"/><name val="Calibri"/></font>
            <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
            <font><b/><sz val="10"/><color rgb="FF065F46"/><name val="Calibri"/></font>
            <font><b/><sz val="9"/><color rgb="FF0369A1"/><name val="Calibri"/></font>
            <font><b/><sz val="9"/><color rgb="FF92400E"/><name val="Calibri"/></font>
            <font><b/><sz val="9"/><color rgb="FF065F46"/><name val="Calibri"/></font>
            <font><b/><sz val="9"/><color rgb="FF991B1B"/><name val="Calibri"/></font>
          </fonts>
          <fills count="11">
            <fill><patternFill patternType="none"/></fill>
            <fill><patternFill patternType="gray125"/></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FF0284C7"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFE0F2FE"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>
            <fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/></patternFill></fill>
          </fills>
          <borders count="3">
            <border><left/><right/><top/><bottom/><diagonal/></border>
            <border>
              <left style="thin"><color rgb="FFE2E8F0"/></left>
              <right style="thin"><color rgb="FFE2E8F0"/></right>
              <top style="thin"><color rgb="FFE2E8F0"/></top>
              <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
              <diagonal/>
            </border>
            <border>
              <left style="thin"><color rgb="FF38BDF8"/></left>
              <right style="thin"><color rgb="FF38BDF8"/></right>
              <top style="thin"><color rgb="FF0369A1"/></top>
              <bottom style="thin"><color rgb="FF0369A1"/></bottom>
              <diagonal/>
            </border>
          </borders>
          <cellStyleXfs count="1">
            <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
          </cellStyleXfs>
          <cellXfs count="14">
            <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
            <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
            <xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
            <xf numFmtId="0" fontId="3" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
            <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
            <xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
            <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
            <xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
            <xf numFmtId="164" fontId="4" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
            <xf numFmtId="164" fontId="4" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
            <xf numFmtId="0" fontId="5" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
            <xf numFmtId="0" fontId="6" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
            <xf numFmtId="0" fontId="7" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
            <xf numFmtId="0" fontId="8" fillId="10" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
          </cellXfs>
        </styleSheet>
        """;

    private static string BuildSheetXml(
        string title,
        string subtitle,
        ColumnSpec[] columns,
        IEnumerable<CellSpec[]> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>");
        sb.AppendLine("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">");
        sb.AppendLine("  <cols>");
        for (var i = 0; i < columns.Length; i++)
        {
            var colNum = i + 1;
            var widthStr = columns[i].CharWidth.ToString("0.0", CultureInfo.InvariantCulture);
            sb.AppendLine($"    <col min=\"{colNum}\" max=\"{colNum}\" width=\"{widthStr}\" customWidth=\"1\"/>");
        }
        sb.AppendLine("  </cols>");
        sb.AppendLine("  <sheetData>");

        var lastColLetter = GetColumnLetter(columns.Length - 1);

        sb.AppendLine("    <row r=\"1\" ht=\"28\" customHeight=\"1\">");
        sb.AppendLine($"      <c r=\"A1\" s=\"{StyleTitle}\" t=\"inlineStr\"><is><t>{EscapeXml(title)}</t></is></c>");
        for (var c = 1; c < columns.Length; c++)
        {
            sb.AppendLine($"      <c r=\"{GetColumnLetter(c)}1\" s=\"{StyleTitle}\"/>");
        }
        sb.AppendLine("    </row>");

        sb.AppendLine("    <row r=\"2\" ht=\"20\" customHeight=\"1\">");
        sb.AppendLine($"      <c r=\"A2\" s=\"{StyleSubtitle}\" t=\"inlineStr\"><is><t>{EscapeXml(subtitle)}</t></is></c>");
        for (var c = 1; c < columns.Length; c++)
        {
            sb.AppendLine($"      <c r=\"{GetColumnLetter(c)}2\" s=\"{StyleSubtitle}\"/>");
        }
        sb.AppendLine("    </row>");

        sb.AppendLine("    <row r=\"3\" ht=\"26\" customHeight=\"1\">");
        for (var c = 0; c < columns.Length; c++)
        {
            sb.AppendLine($"      <c r=\"{GetColumnLetter(c)}3\" s=\"{StyleHeader}\" t=\"inlineStr\"><is><t>{EscapeXml(columns[c].Header)}</t></is></c>");
        }
        sb.AppendLine("    </row>");

        var rowNum = 4;
        foreach (var row in rows)
        {
            sb.AppendLine($"    <row r=\"{rowNum}\" ht=\"21\" customHeight=\"1\">");
            for (var c = 0; c < row.Length; c++)
            {
                var cellRef = $"{GetColumnLetter(c)}{rowNum}";
                var cell = row[c];
                if (cell.IsNumber)
                {
                    sb.AppendLine($"      <c r=\"{cellRef}\" s=\"{cell.StyleIndex}\" t=\"n\"><v>{EscapeXml(cell.Value)}</v></c>");
                }
                else
                {
                    sb.AppendLine($"      <c r=\"{cellRef}\" s=\"{cell.StyleIndex}\" t=\"inlineStr\"><is><t>{EscapeXml(cell.Value)}</t></is></c>");
                }
            }
            sb.AppendLine("    </row>");
            rowNum++;
        }

        sb.AppendLine("  </sheetData>");
        sb.AppendLine("  <mergeCells count=\"2\">");
        sb.AppendLine($"    <mergeCell ref=\"A1:{lastColLetter}1\"/>");
        sb.AppendLine($"    <mergeCell ref=\"A2:{lastColLetter}2\"/>");
        sb.AppendLine("  </mergeCells>");
        sb.AppendLine("</worksheet>");
        return sb.ToString();
    }

    private static string GetColumnLetter(int zeroBasedIndex)
    {
        var dividend = zeroBasedIndex + 1;
        var columnName = string.Empty;
        while (dividend > 0)
        {
            var modulo = (dividend - 1) % 26;
            columnName = Convert.ToChar('A' + modulo) + columnName;
            dividend = (dividend - modulo) / 26;
        }
        return columnName;
    }

    private static string EscapeXml(string value)
    {
        return SecurityElement.Escape(value) ?? string.Empty;
    }
}
